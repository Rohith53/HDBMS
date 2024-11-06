// src/backend/SERVICES/SqlMigrationServices.js

import { createConnection } from 'mysql2/promise';
import { join } from 'path';
import { mapSQLToMySQL as mapSchema } from '../UTILS/MigrationHelper.js';
import { parseSQLData } from '../UTILS/QueryParser.js';
import { localSQLStoragePath } from '../CONFIG/DbConfig.js';
import { info, error as _error } from '../UTILS/Logger.js';

class SQLMigrationService {
    constructor() {
        this.connection = null;
        this.migrationStatus = {
            totalRecords: 0,
            migratedRecords: 0,
            status: 'not started', // 'not started', 'in progress', 'completed', 'failed'
        };
    }

    /**
     * Establishes a connection to the MySQL database.
     * @param {Object} mysqlConfig - Configuration for the MySQL connection (host, user, password, database).
     */
    async connectToMySQL(mysqlConfig) {
        try {
            this.connection = await createConnection(mysqlConfig);
            info('Successfully connected to MySQL.');
        } catch (error) {
            _error('Failed to connect to MySQL:', error);
            throw new Error('MySQL connection error');
        }
    }

    /**
     * Initializes the migration by setting the migration status and loading data.
     * @param {string} tableName - The table name in the local storage.
     * @param {string} mysqlTableName - The target table name in MySQL.
     */
    async initiateMigration(tableName, mysqlTableName) {
        try {
            this.migrationStatus.status = 'in progress';

            // Step 1: Load data from local SQL storage
            const dataFilePath = join(localSQLStoragePath, `${tableName}.json`);
            const data = parseSQLData(dataFilePath);

            // Step 2: Map schema from local to MySQL format
            const schemaMap = await mapSchema(tableName, mysqlTableName, this.connection);

            this.migrationStatus.totalRecords = data.length;
            this.migrationStatus.migratedRecords = 0;

            info(`Initiating migration from ${tableName} to ${mysqlTableName}. Total records: ${data.length}`);
            return data;
        } catch (error) {
            _error('Error during migration initialization:', error);
            this.migrationStatus.status = 'failed';
            throw new Error('Migration initialization failed');
        }
    }

    /**
     * Migrates data from the local SQL storage to the MySQL database.
     * @param {Array} data - The data retrieved from local SQL storage.
     * @param {string} mysqlTableName - The target table name in MySQL.
     */
    async migrateData(data, mysqlTableName) {
        try {
            const schemaMap = await mapSchema(data.tableName, mysqlTableName, this.connection);

            // Step 3: Prepare and execute SQL INSERT statements
            const placeholders = Object.keys(schemaMap).map(() => '?').join(',');
            const insertQuery = `INSERT INTO ${mysqlTableName} (${Object.keys(schemaMap).join(',')}) VALUES (${placeholders})`;

            for (const row of data) {
                const values = Object.keys(schemaMap).map(key => row[key]);
                await this.connection.execute(insertQuery, values);

                // Update migration status
                this.migrationStatus.migratedRecords++;
            }

            info(`Data migration to ${mysqlTableName} completed successfully.`);
        } catch (error) {
            _error('Error during data migration:', error);
            this.migrationStatus.status = 'failed';
            throw new Error('Data migration error');
        }
    }

    /**
     * Migrates SQL data to MySQL directly using the provided SQL data and MySQL configuration.
     * @param {Object} sqlData - The SQL data to be migrated (with fields such as query, tableName).
     * @param {Object} mySQLConfig - The MySQL configuration (host, user, password, database).
     * @returns {Object} - The status of the migration process.
     */
    async migrateSQLToMySQL(sqlData, mySQLConfig) {
        let sourceConnection;
        try {
            // Validate the migration request
            await this.validateSQLMigrationRequest(sqlData);

            this.migrationStatus.status = 'in progress';

            // Step 1: Connect to source SQL database
            sourceConnection = await createConnection(sqlData.sourceSQLConfig);
            info('Successfully connected to source SQL database.');

            // Step 2: Connect to target MySQL database
            await this.connectToMySQL(mySQLConfig);

            // Step 3: Query data from source SQL database
            const [rows] = await sourceConnection.execute(sqlData.query);
            this.migrationStatus.totalRecords = rows.length;
            this.migrationStatus.migratedRecords = 0;

            info(`Fetched ${rows.length} records from source SQL database.`);

            // Step 4: Map schema to MySQL
            const schemaMap = await mapSchema(sqlData.tableName, sqlData.mysqlTableName, this.connection);

            // Step 5: Prepare and execute SQL INSERT statements
            const placeholders = Object.keys(schemaMap).map(() => '?').join(',');
            const insertQuery = `INSERT INTO ${sqlData.mysqlTableName} (${Object.keys(schemaMap).join(',')}) VALUES (${placeholders})`;

            // Step 6: Insert data into MySQL
            for (const row of rows) {
                const values = Object.keys(schemaMap).map(key => row[key]);
                await this.connection.execute(insertQuery, values);

                // Update migration status
                this.migrationStatus.migratedRecords++;
            }

            info(`Successfully migrated ${this.migrationStatus.migratedRecords} records to MySQL.`);
            return this.migrationStatus;
        } catch (error) {
            _error('Error during SQL to MySQL migration:', error);
            this.migrationStatus.status = 'failed';
            throw new Error('SQL to MySQL migration failed');
        } finally {
            if (sourceConnection) await sourceConnection.end();
            await this.closeConnection();
        }
    }

    /**
     * Tracks and returns the current status of the migration.
     * @returns {Object} - The current migration status.
     */
    getMigrationStatus() {
        return this.migrationStatus;
    }

    /**
     * Finalizes the migration, closes the connection, and logs the result.
     */
    async finalizeMigration() {
        try {
            if (this.migrationStatus.status === 'in progress') {
                this.migrationStatus.status = 'completed';
            }
            info(`Migration completed. Migrated ${this.migrationStatus.migratedRecords} out of ${this.migrationStatus.totalRecords} records.`);

            // Close MySQL connection
            if (this.connection) {
                await this.connection.end();
                info('MySQL connection closed.');
            }
        } catch (error) {
            _error('Error during finalization:', error);
            throw new Error('Migration finalization failed');
        }
    }

    /**
     * Closes the MySQL database connection.
     */
    async closeConnection() {
        if (this.connection) {
            await this.connection.end();
            info('MySQL connection closed.');
        }
    }

    /**
     * Validates the SQL migration request.
     * @param {Object} sqlData - The SQL data request containing query, table name, and MySQL config.
     * @throws Will throw an error if validation fails.
     */
    async validateSQLMigrationRequest(sqlData) {
        // Step 1: Validate request structure
        if (!sqlData || !sqlData.sourceSQLConfig || !sqlData.query || !sqlData.tableName || !sqlData.mysqlTableName) {
            throw new Error('Invalid migration request. Missing required fields.');
        }

        // Step 2: Validate database connections
        try {
            const sourceConnection = await createConnection(sqlData.sourceSQLConfig);
            await sourceConnection.end();
            await this.connectToMySQL(sqlData.mysqlConfig);
            info('Database connections validated successfully.');
        } catch (error) {
            _error('Database connection validation failed:', error);
            throw new Error('Database connection validation failed');
        }

        // Step 3: Ensure source table exists and contains data
        const sourceConnection = await createConnection(sqlData.sourceSQLConfig);
        const [rows] = await sourceConnection.execute(`SELECT * FROM ${sqlData.tableName} LIMIT 1`);
        if (rows.length === 0) {
            throw new Error(`Source table ${sqlData.tableName} is empty or does not exist.`);
        }

        // Step 4: Check for matching column schema between source and MySQL
        const schemaMap = await mapSchema(sqlData.tableName, sqlData.mysqlTableName, this.connection);
        if (!schemaMap) {
            throw new Error('Schema mapping failed. Ensure that the source table and MySQL table schema match.');
        }

        info('SQL migration request validation passed.');
    }
}

// Export the methods within the class
export const initiateMigration = SQLMigrationService.prototype.initiateMigration;
export const migrateData = SQLMigrationService.prototype.migrateData;
export const getMigrationStatus = SQLMigrationService.prototype.getMigrationStatus;
export const finalizeMigration = SQLMigrationService.prototype.finalizeMigration;
export const connectToMySQL = SQLMigrationService.prototype.connectToMySQL;
export const closeConnection = SQLMigrationService.prototype.closeConnection;
export const migrateSQLToMySQL = SQLMigrationService.prototype.migrateSQLToMySQL;
export const validateSQLMigrationRequest = SQLMigrationService.prototype.validateSQLMigrationRequest;

export default SQLMigrationService;
