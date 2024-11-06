// Import necessary modules and dependencies
const mysql = require('mysql2/promise');        // MySQL client for database connections
const fs = require('fs');                       // File system module for reading local data
const path = require('path');                   // Path module for managing file paths
const clusterModule = require('./ClusterModule.js'); // Cluster storage management module
const logger = require('../UTILS/Logger.js');      // Logging utility for error and debug messages
const dbConfig = require('../CONFIG/DbConfig.js'); // Configuration for database settings

// Define the SQLMigrationModule class
class SQLMigrationModule {
    constructor(mysqlConfig, dataDir) {
        this.mysqlConfig = mysqlConfig || dbConfig.mysql; // MySQL configuration
        this.dataDir = dataDir || dbConfig.sqlDataPath;   // Directory where SQL data is stored
    }

    // Initialize MySQL connection
    async connectToMySQL() {
        try {
            this.connection = await mysql.createConnection(this.mysqlConfig);
            logger.info("Connected to MySQL successfully.");
        } catch (error) {
            logger.error("Failed to connect to MySQL:", error);
            throw new Error("MySQL connection failed.");
        }
    }

    // Disconnect from MySQL
    async disconnectFromMySQL() {
        if (this.connection) {
            await this.connection.end();
            logger.info("Disconnected from MySQL.");
        }
    }

    // Retrieve data path for a specific table
    getTablePath(tableName) {
        return path.join(this.dataDir, `${tableName}.json`);
    }

    // Read local SQL table data from cluster storage
    async readLocalTableData(tableName) {
        try {
            const tablePath = this.getTablePath(tableName);
            const tableData = await clusterModule.readData(tablePath);
            logger.info(`Loaded data from local table: ${tableName}`);
            return JSON.parse(tableData);
        } catch (error) {
            logger.error(`Failed to load local data for table ${tableName}:`, error);
            throw new Error(`Data load failed for table ${tableName}`);
        }
    }

    // Configure MySQL table structure before migration
    async configureMySQLTable(tableName, tableSchema) {
        const columns = tableSchema.map(
            ({ name, type, isPrimaryKey }) => `${name} ${type}${isPrimaryKey ? ' PRIMARY KEY' : ''}`
        );
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')});`;

        try {
            await this.connection.query(createTableQuery);
            logger.info(`MySQL table ${tableName} configured successfully.`);
        } catch (error) {
            logger.error(`Failed to configure MySQL table ${tableName}:`, error);
            throw new Error(`Configuration failed for MySQL table ${tableName}`);
        }
    }

    // Migrate data from local SQL table to MySQL
    async migrateTableToMySQL(localTableName, mysqlTableName, tableSchema) {
        try {
            // Connect to MySQL
            await this.connectToMySQL();

            // Configure MySQL table based on schema
            await this.configureMySQLTable(mysqlTableName, tableSchema);

            // Retrieve data from local table
            const localData = await this.readLocalTableData(localTableName);

            // Insert data into MySQL
            const placeholders = tableSchema.map(() => '?').join(', ');
            const insertQuery = `INSERT INTO ${mysqlTableName} VALUES (${placeholders})`;

            for (const row of localData) {
                const rowData = tableSchema.map(col => row[col.name]);
                await this.connection.query(insertQuery, rowData);
            }

            logger.info(`Successfully migrated ${localData.length} rows to MySQL table ${mysqlTableName}.`);
            return { message: `Migrated ${localData.length} rows.`, success: true };
        } catch (error) {
            logger.error(`Migration failed for table ${localTableName}:`, error);
            throw new Error(`Migration failed for table ${localTableName}.`);
        } finally {
            // Ensure MySQL disconnection
            await this.disconnectFromMySQL();
        }
    }

    // Migrate all local SQL tables to MySQL
    async migrateAllTables() {
        const tables = fs.readdirSync(this.dataDir).map(file => path.parse(file).name);
        let migrationSummary = {};

        for (const tableName of tables) {
            try {
                // Assuming each table has a pre-defined schema in `dbConfig`
                const tableSchema = dbConfig.tableSchemas[tableName];
                if (!tableSchema) {
                    throw new Error(`Schema not found for table ${tableName}`);
                }

                const migrationResult = await this.migrateTableToMySQL(tableName, tableName, tableSchema);
                migrationSummary[tableName] = migrationResult.message;
            } catch (error) {
                migrationSummary[tableName] = `Migration failed: ${error.message}`;
            }
        }

        return migrationSummary;
    }
}

// Export SQLMigrationModule for use in other parts of the application
module.exports = SQLMigrationModule;
