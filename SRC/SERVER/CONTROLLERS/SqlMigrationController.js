// src/backend/controllers/sqlMigrationController.js

import { initiateMigration, getMigrationStatus, finalizeMigration } from '../SERVICES/SqlMigrationServices.js';
import { validationResult } from 'express-validator';

// Controller to handle SQL to MySQL migration
class SqlMigrationController {
    // Start SQL Migration
    async startMigration(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { sourceSQLConfig, targetMySQLConfig } = req.body;
            const migrationId = await initiateMigration(sourceSQLConfig, targetMySQLConfig);
            res.status(202).json({ message: 'Migration started successfully', migrationId });
        } catch (error) {
            console.error('Migration Error:', error);
            res.status(500).json({ error: 'An error occurred during migration' });
        }
    }

    // Check Migration Status
    async checkMigrationStatus(req, res) {
        const { migrationId } = req.params;
        
        try {
            const status = await getMigrationStatus(migrationId);
            res.status(200).json({ migrationId, status });
        } catch (error) {
            console.error('Status Check Error:', error);
            res.status(500).json({ error: 'Could not retrieve migration status' });
        }
    }

    // Complete Migration
    async completeMigration(req, res) {
        const { migrationId } = req.params;

        try {
            const result = await finalizeMigration(migrationId);
            res.status(200).json({ message: 'Migration completed successfully', result });
        } catch (error) {
            console.error('Migration Completion Error:', error);
            res.status(500).json({ error: 'Could not complete migration' });
        }
    }
}

export default new SqlMigrationController();
