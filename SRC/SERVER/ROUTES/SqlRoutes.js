// sqlRoutes.js

import { Router } from 'express';
const router = Router();

import { 
    getAllTables, 
    createTable, 
    getTableRecords, 
    insertRecord, 
    updateRecordById, 
    deleteRecordById 
} from '../CONTROLLERS/SqlController.js';

import { validateTableSchema, validateTableExists, validateRecordData } from '../MIDDLEWARE/ValidationMiddleware.js';
import { errorHandler } from '../MIDDLEWARE/ErrorHandler.js';


// Route to retrieve all tables
router.get('/tables', getAllTables);

// Route to create a new SQL table
router.post('/table', validateTableSchema, createTable);

// Route to retrieve all records from a specific table
router.get('/table/:tableName', validateTableExists, getTableRecords);

// Route to insert a new record into a specific table
router.post('/table/:tableName', 
    validateTableExists, 
    validateRecordData, 
    insertRecord
);

// Route to update an existing record in a specific table by primary key
router.put('/table/:tableName/:id', 
    validateTableExists, 
    validateRecordData, 
    updateRecordById
);

// Route to delete a record in a specific table by primary key
router.delete('/table/:tableName/:id', 
    validateTableExists, 
    deleteRecordById
);

// Error handling middleware for all SQL routes
router.use(errorHandler);

export default router;
