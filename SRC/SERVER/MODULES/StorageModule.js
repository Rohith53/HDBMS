// Import required modules
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { info, error as _error } from '../UTILS/Logger.js'; // Logger utility for logging errors and operations

// Define storage paths for SQL and NoSQL data
const dataDir = join(__dirname, '../../data');
const sqlDataDir = join(dataDir, 'sql_data');
const noSqlDataDir = join(dataDir, 'nosql_data');

// StorageModule class definition
class StorageModule {
    constructor() {
        this.initializeDirectories();
    }

    // Initialize storage directories if they do not exist
    initializeDirectories() {
        try {
            if (!existsSync(dataDir)) mkdirSync(dataDir);
            if (!existsSync(sqlDataDir)) mkdirSync(sqlDataDir);
            if (!existsSync(noSqlDataDir)) mkdirSync(noSqlDataDir);
            info("Storage directories initialized successfully.");
        } catch (error) {
            _error("Error initializing storage directories: ", error);
            throw new Error("Storage directory initialization failed.");
        }
    }

    // Save SQL table data to a JSON file
    saveSQLData(tableName, data) {
        try {
            const filePath = join(sqlDataDir, `${tableName}.json`);
            writeFileSync(filePath, JSON.stringify(data, null, 2));
            info(`SQL table ${tableName} saved successfully.`);
        } catch (error) {
            _error(`Error saving SQL table ${tableName}: `, error);
            throw new Error(`Failed to save SQL table ${tableName}.`);
        }
    }

    // Load SQL table data from a JSON file
    loadSQLData(tableName) {
        try {
            const filePath = join(sqlDataDir, `${tableName}.json`);
            if (existsSync(filePath)) {
                const data = JSON.parse(readFileSync(filePath, 'utf8'));
                info(`SQL table ${tableName} loaded successfully.`);
                return data;
            } else {
                throw new Error(`SQL table ${tableName} does not exist.`);
            }
        } catch (error) {
            _error(`Error loading SQL table ${tableName}: `, error);
            throw new Error(`Failed to load SQL table ${tableName}.`);
        }
    }

    // Delete SQL table data file
    deleteSQLData(tableName) {
        try {
            const filePath = join(sqlDataDir, `${tableName}.json`);
            if (existsSync(filePath)) {
                unlinkSync(filePath);
                info(`SQL table ${tableName} deleted successfully.`);
            } else {
                throw new Error(`SQL table ${tableName} does not exist.`);
            }
        } catch (error) {
            _error(`Error deleting SQL table ${tableName}: `, error);
            throw new Error(`Failed to delete SQL table ${tableName}.`);
        }
    }

    // Save NoSQL collection data to a JSON file
    saveNoSQLData(collectionName, data) {
        try {
            const filePath = join(noSqlDataDir, `${collectionName}.json`);
            writeFileSync(filePath, JSON.stringify(data, null, 2));
            info(`NoSQL collection ${collectionName} saved successfully.`);
        } catch (error) {
            _error(`Error saving NoSQL collection ${collectionName}: `, error);
            throw new Error(`Failed to save NoSQL collection ${collectionName}.`);
        }
    }

    // Load NoSQL collection data from a JSON file
    loadNoSQLData(collectionName) {
        try {
            const filePath = join(noSqlDataDir, `${collectionName}.json`);
            if (existsSync(filePath)) {
                const data = JSON.parse(readFileSync(filePath, 'utf8'));
                info(`NoSQL collection ${collectionName} loaded successfully.`);
                return data;
            } else {
                throw new Error(`NoSQL collection ${collectionName} does not exist.`);
            }
        } catch (error) {
            _error(`Error loading NoSQL collection ${collectionName}: `, error);
            throw new Error(`Failed to load NoSQL collection ${collectionName}.`);
        }
    }

    // Delete NoSQL collection data file
    deleteNoSQLData(collectionName) {
        try {
            const filePath = join(noSqlDataDir, `${collectionName}.json`);
            if (existsSync(filePath)) {
                unlinkSync(filePath);
                info(`NoSQL collection ${collectionName} deleted successfully.`);
            } else {
                throw new Error(`NoSQL collection ${collectionName} does not exist.`);
            }
        } catch (error) {
            _error(`Error deleting NoSQL collection ${collectionName}: `, error);
            throw new Error(`Failed to delete NoSQL collection ${collectionName}.`);
        }
    }
}

export default new StorageModule();
