// src/backend/routes/sqlMigrationRoutes.js

import { Router } from 'express';
import { migrateSQLToMySQL } from '../SERVICES/SqlMigrationServices.js';
import { validateSQLMigrationRequest } from '../SERVICES/SqlMigrationServices.js';
const router = Router();

// Route to initiate SQL to MySQL migration
router.post('/migrate', validateSQLMigrationRequest, async (req, res) => {
    try {
        // Extract migration data from request body
        const { sqlData, mySQLConfig } = req.body;

        // Call the controller function to perform migration
        const result = await migrateSQLToMySQL(sqlData, mySQLConfig);

        // Send success response
        return res.status(200).json({
            success: true,
            message: 'Migration successful',
            data: result,
        });
    } catch (error) {
        // Handle errors and send appropriate response
        console.error('Migration Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Migration failed',
            error: error.message,
        });
    }
});

export default router;
