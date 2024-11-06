// Import necessary modules
import { Router } from 'express';
const router = Router();
import { validateSQLSchema, validateNoSQLSchema } from '../MIDDLEWARE/ValidationMiddleware.js';
import {sqlToNoSql as convertToNoSQL, noSQLToSQL as convertToSQL} from '../MODULES/DataConversionModule.js'

// Route to convert SQL data to NoSQL format convertToNoSQL, convertToSQL, 
router.post('/convertToNoSQL', convertToNoSQL);

// Route to convert NoSQL data to SQL format
router.post('/convertToSQL', convertToSQL);

// Route to validate SQL schema before conversion (optional but recommended)
router.post('/validateSQLSchema', validateSQLSchema);

// Route to validate NoSQL schema before conversion (optional)
router.post('/validateNoSQLSchema', validateNoSQLSchema);

export default router;
