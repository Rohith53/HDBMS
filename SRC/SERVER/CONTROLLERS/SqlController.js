// SqlController.js

import { 
    createNewTable, 
    getAllTables as fetchAllTables, 
    getTableRecords as fetchRecordsFromDB, 
    insert, 
    update, 
    deleteRecord as deleteRecordFromDB 
} from '../MODELS/SqlModel.js';
import Logger from '../UTILS/Logger.js';

// Create a new table in the database
export const createTable = async (req, res) => {
    const { tableName, schema } = req.body;

    try {
        const result = await createNewTable(tableName, schema);
        return res.status(201).json({
            success: true,
            message: 'Table created successfully',
            data: result,
        });
    } catch (error) {
        Logger.error(`Failed to create table: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Failed to create table',
            error: error.message,
        });
    }
};

// Get all tables in the database
export const getAllTables = async (req, res) => {
    try {
        const tables = await fetchAllTables();
        return res.status(200).json({
            success: true,
            message: 'Tables retrieved successfully',
            data: tables,
        });
    } catch (error) {
        Logger.error(`Failed to retrieve tables: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve tables',
            error: error.message,
        });
    }
};

// Read records from the specified table
export const getTableRecords = async (req, res) => {
    const { tableName, conditions, limit = 10, offset = 0 } = req.query;

    try {
        const records = await fetchRecordsFromDB(tableName, conditions, limit, offset);
        return res.status(200).json({
            success: true,
            message: 'Records retrieved successfully',
            data: records,
        });
    } catch (error) {
        Logger.error(`Failed to retrieve records: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve records',
            error: error.message,
        });
    }
};

// Create a new record in the specified table
export const insertRecord = async (req, res) => {
    const { tableName, data } = req.body;

    try {
        const result = await insert(tableName, data);
        return res.status(201).json({
            success: true,
            message: 'Record created successfully',
            data: result,
        });
    } catch (error) {
        Logger.error(`Failed to create record: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Failed to create record',
            error: error.message,
        });
    }
};

// Update a record in the specified table
export const updateRecordById = async (req, res) => {
    const { tableName, data, conditions } = req.body;

    try {
        const result = await update(tableName, data, conditions);
        return res.status(200).json({
            success: true,
            message: 'Record updated successfully',
            data: result,
        });
    } catch (error) {
        Logger.error(`Failed to update record: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Failed to update record',
            error: error.message,
        });
    }
};

// Delete a record from the specified table
export const deleteRecordById = async (req, res) => {
    const { tableName, conditions } = req.body;

    try {
        const result = await deleteRecordFromDB(tableName, conditions);
        return res.status(200).json({
            success: true,
            message: 'Record deleted successfully',
            data: result,
        });
    } catch (error) {
        Logger.error(`Failed to delete record: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete record',
            error: error.message,
        });
    }
};
