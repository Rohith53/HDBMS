// src/backend/controllers/dataConversionController.js
import { sqlToNoSql, noSQLToSQL } from '../MODULES/DataConversionModule.js';

import { validateSQLInput, validateNoSQLInput, validateSQLSchema, validateNoSQLSchema } from '../MIDDLEWARE/ValidationMiddleware.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { info } from '../UTILS/Logger.js';


/**
 * Controller to handle data conversion requests between SQL and NoSQL.
 */
class DataConversionController {

    /**
     * Converts SQL data to NoSQL format.
     * @param {Object} req - The request object containing SQL data.
     * @param {Object} res - The response object.
     */
    static async convertSQLToNoSQL(req, res) {
        try {
            // Validate SQL input data
            const isValidData = validateSQLInput(req.body);
            if (!isValidData) {
                return res.status(400).json({ success: false, message: 'Invalid SQL input data' });
            }

            // Validate SQL schema structure
            const isValidSchema = validateSQLSchema(req.body.schema);
            if (!isValidSchema) {
                return res.status(400).json({ success: false, message: 'Invalid SQL schema structure' });
            }

            // Perform the conversion
            const noSQLData = await sqlToNoSql(req.body);
            info('Successfully converted SQL data to NoSQL format.');
            return res.status(200).json({ success: true, data: noSQLData });
        } catch (error) {
            errorHandler(res, error);
        }
    }

    /**
     * Converts NoSQL data to SQL format.
     * @param {Object} req - The request object containing NoSQL data.
     * @param {Object} res - The response object.
     */
    static async convertNoSQLToSQL(req, res) {
        try {
            // Validate NoSQL input data
            const isValidData = validateNoSQLInput(req.body);
            if (!isValidData) {
                return res.status(400).json({ success: false, message: 'Invalid NoSQL input data' });
            }

            // Validate NoSQL schema structure
            const isValidSchema = validateNoSQLSchema(req.body.schema);
            if (!isValidSchema) {
                return res.status(400).json({ success: false, message: 'Invalid NoSQL schema structure' });
            }

            // Perform the conversion
            const sqlData = await noSQLToSQL(req.body);
            info('Successfully converted NoSQL data to SQL format.');
            return res.status(200).json({ success: true, data: sqlData });
        } catch (error) {
            errorHandler(res, error);
        }
    }

    /**
     * Converts SQL data to NoSQL format without validation.
     * This can be used when validation is handled elsewhere.
     * @param {Object} req - The request object containing SQL data.
     * @param {Object} res - The response object.
     */
    static async convertToNoSQL(req, res) {
        try {
            const noSQLData = await sqlToNoSql(req.body);
            info('Converted SQL data to NoSQL format.');
            return res.status(200).json({ success: true, data: noSQLData });
        } catch (error) {
            errorHandler(res, error);
        }
    }

    /**
     * Converts NoSQL data to SQL format without validation.
     * This can be used when validation is handled elsewhere.
     * @param {Object} req - The request object containing NoSQL data.
     * @param {Object} res - The response object.
     */
    static async convertToSQL(req, res) {
        try {
            const sqlData = await noSQLToSQL(req.body);
            info('Converted NoSQL data to SQL format.');
            return res.status(200).json({ success: true, data: sqlData });
        } catch (error) {
            errorHandler(res, error);
        }
    }
}

export default DataConversionController;
