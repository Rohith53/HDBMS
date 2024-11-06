// Import necessary modules and utilities
import { sqlToNoSQL, noSQLToSQL } from '../UTILS/DataTranslator.js';
import { getTableData, insertData } from '../MODELS/SqlModel.js';
import { getCollectionData, insertData as _insertData } from '../MODELS/NoSqlModel.js';
import { info, error as _error } from '../UTILS/Logger.js';

class DataConversionService {
    
    /**
     * Converts SQL data to NoSQL format.
     * @param {string} tableName - Name of the SQL table to convert.
     * @returns {Promise<Object[]>} - Returns an array of NoSQL documents.
     */
    async convertSQLToNoSQL(tableName) {
        try {
            // Step 1: Fetch data from SQL table
            const sqlData = await getTableData(tableName);
            
            // Step 2: Convert SQL data to NoSQL format
            const noSQLData = sqlData.map(row => sqlToNoSQL(row));
            
            info(`Converted data from SQL table ${tableName} to NoSQL format successfully.`);
            return noSQLData;
        } catch (error) {
            _error(`Error converting SQL to NoSQL for table ${tableName}: ${error.message}`);
            throw new Error('SQL to NoSQL data conversion failed');
        }
    }

    /**
     * Converts NoSQL data to SQL format.
     * @param {string} collectionName - Name of the NoSQL collection to convert.
     * @param {string} sqlTableName - Target SQL table name for converted data.
     * @returns {Promise<Object[]>} - Returns an array of SQL rows.
     */
    async convertNoSQLToSQL(collectionName, sqlTableName) {
        try {
            // Step 1: Fetch data from NoSQL collection
            const noSQLData = await getCollectionData(collectionName);
            
            // Step 2: Convert NoSQL data to SQL format
            const sqlData = noSQLData.map(doc => noSQLToSQL(doc, sqlTableName));
            
            info(`Converted data from NoSQL collection ${collectionName} to SQL table ${sqlTableName} successfully.`);
            return sqlData;
        } catch (error) {
            _error(`Error converting NoSQL to SQL for collection ${collectionName}: ${error.message}`);
            throw new Error('NoSQL to SQL data conversion failed');
        }
    }

    /**
     * Saves converted NoSQL data into SQL table.
     * @param {string} collectionName - Name of the NoSQL collection to convert.
     * @param {string} sqlTableName - Target SQL table name to save data.
     */
    async saveNoSQLToSQL(collectionName, sqlTableName) {
        try {
            const sqlData = await this.convertNoSQLToSQL(collectionName, sqlTableName);
            await insertData(sqlTableName, sqlData);
            info(`Successfully saved converted NoSQL data to SQL table ${sqlTableName}.`);
        } catch (error) {
            _error(`Failed to save NoSQL data to SQL table ${sqlTableName}: ${error.message}`);
            throw new Error('Saving NoSQL to SQL failed');
        }
    }

    /**
     * Saves converted SQL data into NoSQL collection.
     * @param {string} tableName - Name of the SQL table to convert.
     * @param {string} collectionName - Target NoSQL collection name to save data.
     */
    async saveSQLToNoSQL(tableName, collectionName) {
        try {
            const noSQLData = await this.convertSQLToNoSQL(tableName);
            await _insertData(collectionName, noSQLData);
            info(`Successfully saved converted SQL data to NoSQL collection ${collectionName}.`);
        } catch (error) {
            _error(`Failed to save SQL data to NoSQL collection ${collectionName}: ${error.message}`);
            throw new Error('Saving SQL to NoSQL failed');
        }
    }
}

export default new DataConversionService();
