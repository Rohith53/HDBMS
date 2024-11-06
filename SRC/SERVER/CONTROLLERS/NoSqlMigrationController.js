// src/backend/controllers/nosqlMigrationController.js
import { migrateData } from '../SERVICES/NoSqlMigrationServices.js';
import MigrationModel from '../MODELS/MigrationModel.js';
import { findOne, find, findById } from '../MODELS/NoSqlModel.js'

// Handler for initiating NoSQL migration
export async function initiateMigration(req, res) {
    const { sourceCollection, targetDB, targetCollection } = req.body;

    try {
        // Validate request parameters
        if (!sourceCollection || !targetDB || !targetCollection) {
            return res.status(400).json({ error: 'Source collection, target database, and target collection must be provided.' });
        }

        // Check migration configuration
        const migrationConfig = await findOne({ sourceCollection, targetDB, targetCollection });
        if (migrationConfig) {
            return res.status(409).json({ error: 'Migration configuration already exists. Please use a different target or source.' });
        }

        // Create a new migration record
        const migrationRecord = new MigrationModel({
            sourceCollection,
            targetDB,
            targetCollection,
            status: 'initiated',
            createdAt: new Date(),
        });
        await migrationRecord.save();

        // Start the migration process
        const result = await migrateData(sourceCollection, targetDB, targetCollection);
        
        // Update migration record status
        migrationRecord.status = result.success ? 'completed' : 'failed';
        await migrationRecord.save();

        res.status(200).json({ message: 'Migration initiated successfully.', result });
    } catch (error) {
        console.error('Error during migration:', error);
        res.status(500).json({ error: 'An error occurred during the migration process.' });
    }
}

// Handler for retrieving migration status
export async function getMigrationStatus(req, res) {
    const { migrationId } = req.params;

    try {
        const migrationRecord = await MigrationModel.findById(migrationId);
        if (!migrationRecord) {
            return res.status(404).json({ error: 'Migration record not found.' });
        }

        res.status(200).json({ status: migrationRecord.status });
    } catch (error) {
        console.error('Error retrieving migration status:', error);
        res.status(500).json({ error: 'Failed to retrieve migration status.' });
    }
}

// Handler for retrieving migration configurations
export async function getMigrationConfigurations(req, res) {
    try {
        const configurations = await find();
        res.status(200).json(configurations);
    } catch (error) {
        console.error('Error retrieving migration configurations:', error);
        res.status(500).json({ error: 'Failed to retrieve migration configurations.' });
    }
}

// Handler for retrieving migration logs
export async function getMigrationLogs(req, res) {
    try {
        const logs = await find().sort({ createdAt: -1 });
        res.status(200).json(logs);
    } catch (error) {
        console.error('Error retrieving migration logs:', error);
        res.status(500).json({ error: 'Failed to retrieve migration logs.' });
    }
}

// Handler for cancelling a migration
export async function cancelMigration(req, res) {
    const { migrationId } = req.body;

    try {
        const migrationRecord = await findById(migrationId);
        if (!migrationRecord) {
            return res.status(404).json({ error: 'Migration record not found.' });
        }

        // Cancel logic can be added here if supported (e.g., marking as cancelled)
        migrationRecord.status = 'cancelled';
        await migrationRecord.save();

        res.status(200).json({ message: 'Migration cancelled successfully.' });
    } catch (error) {
        console.error('Error cancelling migration:', error);
        res.status(500).json({ error: 'Failed to cancel migration.' });
    }
}

// Export functions
