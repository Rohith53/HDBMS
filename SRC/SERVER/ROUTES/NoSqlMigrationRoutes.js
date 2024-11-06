// src/backend/routes/nosqlMigrationRoutes.js

import { Router } from 'express';
const router = Router();
import { initiateMigration, getMigrationStatus, getMigrationConfigurations } from '../CONTROLLERS/NoSqlMigrationController.js';
import { validateMigrationRequest } from '../MIDDLEWARE/ValidationMiddleware.js';
import { errorHandler as handleErrors } from '../MIDDLEWARE/ErrorHandler.js';

/**
 * @route POST /api/nosql/migrate
 * @desc Initiate migration from NoSQL to MongoDB
 * @access Public
 */
router.post('/migrate', validateMigrationRequest, handleErrors, async (req, res) => {
    try {
        const migrationConfig = req.body; // Expecting migration configuration in the request body
        const result = await initiateMigration(migrationConfig);
        return res.status(200).json({
            message: 'Migration initiated successfully.',
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error initiating migration.',
            error: error.message
        });
    }
});

/**
 * @route GET /api/nosql/migrate/status/:migrationId
 * @desc Get the status of a migration process
 * @access Public
 */
router.get('/migrate/status/:migrationId', handleErrors, async (req, res) => {
    try {
        const { migrationId } = req.params;
        const status = await getMigrationStatus(migrationId);
        return res.status(200).json({
            message: 'Migration status retrieved successfully.',
            status: status
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving migration status.',
            error: error.message
        });
    }
});

/**
 * @route GET /api/nosql/migrate/configurations
 * @desc Get available migration configurations
 * @access Public
 */
router.get('/migrate/configurations', handleErrors, async (req, res) => {
    try {
        const configurations = await getMigrationConfigurations();
        return res.status(200).json({
            message: 'Migration configurations retrieved successfully.',
            configurations: configurations
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving migration configurations.',
            error: error.message
        });
    }
});

export default router;
