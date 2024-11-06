// src/backend/utils/migrationHelper.js

import { validateSQLData, validateNoSQLData } from '../MIDDLEWARE/ValidationMiddleware.js';
import { formatForMySQL, formatForMongoDB } from './DataTranslator.js';
import { insert as _insertData } from '../MODULES/NoSqlModule.js';

/**
 * Maps the SQL data to MySQL schema.
 * @param {Object} sqlRow - The individual SQL row to be mapped.
 * @param {Object} sqlSchema - The target schema for MySQL.
 * @returns {Object} - The mapped data according to the MySQL schema.
 */
export function mapSQLToMySQL(sqlRow, sqlSchema) {
    const mappedRow = {};

    // Map fields from SQL to MySQL schema
    for (const key in sqlRow) {
        // Assuming the SQL schema keys are mapped to MySQL schema keys
        const mysqlKey = sqlSchema[key] || key; // Default to SQL key if no mapping found
        mappedRow[mysqlKey] = sqlRow[key];
    }

    return mappedRow;
}

/**
 * Maps the NoSQL data to MongoDB schema.
 * @param {Object} noSqlDoc - The NoSQL document to be mapped.
 * @param {Object} mongoSchema - The target schema for MongoDB.
 * @returns {Object} - The mapped document according to MongoDB schema.
 */
export function mapNoSQLToMongoDB(noSqlDoc, mongoSchema) {
    const mappedDoc = {};

    // Map fields from NoSQL to MongoDB schema
    for (const key in noSqlDoc) {
        // Assuming the NoSQL schema keys are mapped to MongoDB schema keys
        const mongoKey = mongoSchema[key] || key; // Default to NoSQL key if no mapping found
        mappedDoc[mongoKey] = noSqlDoc[key];
    }

    return mappedDoc;
}

/**
 * Migrates data from SQL to MySQL
 * @param {Array} sqlData - The data retrieved from SQL
 * @param {Object} sqlSchema - The target schema for MySQL
 * @returns {Promise<Array>} - The result of the migration operation
 */
export async function migrateSQLToMySQL(sqlData, sqlSchema) {
    try {
        // Validate SQL data before migration
        const isValid = sqlData.every(validateSQLData);
        if (!isValid) throw new Error('Invalid SQL data format.');

        // Map SQL data to MySQL schema
        const mappedData = sqlData.map(row => mapSQLToMySQL(row, sqlSchema));

        // Format data for MySQL
        const formattedData = mappedData.map(formatForMySQL);

        // Perform the migration using MySQL specific module
        const result = await _insertData(formattedData);
        return result;
    } catch (error) {
        console.error('Migration from SQL to MySQL failed:', error);
        throw error;
    }
}

/**
 * Migrates data from NoSQL to MongoDB
 * @param {Array} nosqlData - The data retrieved from NoSQL
 * @param {Object} mongoSchema - The target schema for MongoDB
 * @returns {Promise<Array>} - The result of the migration operation
 */
export async function migrateNoSQLToMongoDB(nosqlData, mongoSchema) {
    try {
        // Validate NoSQL data before migration
        const isValid = nosqlData.every(validateNoSQLData);
        if (!isValid) throw new Error('Invalid NoSQL data format.');

        // Map NoSQL data to MongoDB schema
        const mappedData = nosqlData.map(doc => mapNoSQLToMongoDB(doc, mongoSchema));

        // Format data for MongoDB
        const formattedData = mappedData.map(formatForMongoDB);

        // Perform the migration using MongoDB specific module
        const result = await _insertData(formattedData);
        return result;
    } catch (error) {
        console.error('Migration from NoSQL to MongoDB failed:', error);
        throw error;
    }
}

