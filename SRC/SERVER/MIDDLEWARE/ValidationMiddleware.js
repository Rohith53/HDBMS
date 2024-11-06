// src/backend/middleware/validationMiddleware.js

import { check, validationResult, body } from 'express-validator';

// Middleware for SQL request validation
export const validateSQLRequest = [
    check('tableName')
        .notEmpty().withMessage('Table name is required')
        .isString().withMessage('Table name must be a string'),

    check('schema')
        .optional()
        .isArray().withMessage('Schema should be an array of column definitions')
        .custom(schema =>
            schema.every(col =>
                typeof col.name === 'string' &&
                typeof col.type === 'string'
            )
        ).withMessage('Each column should have a name and type as strings'),

    check('data')
        .optional()
        .isObject().withMessage('Data should be a valid JSON object')
        .custom(data => Object.keys(data).length > 0)
        .withMessage('Data cannot be an empty object'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware for NoSQL request validation
export const validateNoSQLRequest = [
    check('collection')
        .notEmpty().withMessage('Collection name is required')
        .isString().withMessage('Collection name must be a string'),

    check('action')
        .notEmpty().withMessage('Action is required')
        .isIn(['FIND', 'INSERT', 'UPDATE', 'DELETE']).withMessage('Invalid NoSQL action'),

    check('document')
        .optional()
        .isObject().withMessage('Document should be a valid JSON object')
        .custom(doc => Object.keys(doc).length > 0)
        .withMessage('Document cannot be an empty object'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware to validate NoSQL schema structure
export const validateNoSQLSchema = [
    check('schema')
        .isArray().withMessage('Schema should be an array of field definitions')
        .custom(schema =>
            schema.every(field =>
                typeof field.name === 'string' &&
                typeof field.type === 'string'
            )
        ).withMessage('Each field should have a name and type as strings'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware to validate NoSQL input (new functionality)
export const validateNoSQLInput = [
    check('collection')
        .notEmpty().withMessage('Collection name is required')
        .isString().withMessage('Collection name must be a string'),

    check('document')
        .notEmpty().withMessage('Document is required')
        .isObject().withMessage('Document should be a valid JSON object')
        .custom(doc => {
            // Check for required fields in the document (can customize as per schema)
            const requiredFields = ['name', 'value']; // Adjust based on the schema
            const missingFields = requiredFields.filter(field => !(field in doc));
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }
            return true;
        })
        .custom(doc => Object.keys(doc).length > 0)
        .withMessage('Document cannot be an empty object'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware to validate if a table exists (for SQL operations)
export const validateTableExists = (req, res, next) => {
    const { tableName } = req.params;

    // Implement logic here to check if the table exists
    const tableExists = true; // Placeholder logic; replace with actual check

    if (!tableExists) {
        return res.status(404).json({ error: `Table ${tableName} does not exist` });
    }
    next();
};

// Middleware to validate record data structure
export const validateRecordData = [
    check('data')
        .notEmpty().withMessage('Data is required')
        .isObject().withMessage('Data should be a valid JSON object')
        .custom(data => Object.keys(data).length > 0)
        .withMessage('Data cannot be an empty object'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware to validate schema structure
export const validateTableSchema = [
    check('schema')
        .isArray().withMessage('Schema should be an array of column definitions')
        .custom(schema =>
            schema.every(col =>
                typeof col.name === 'string' &&
                typeof col.type === 'string'
            )
        ).withMessage('Each column should have a name and type as strings'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware to validate NoSQL document structure
export const validateNoSQLDocument = [
    check('document')
        .notEmpty().withMessage('Document is required')
        .isObject().withMessage('Document should be a valid JSON object')
        .custom(doc => Object.keys(doc).length > 0)
        .withMessage('Document cannot be an empty object'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware to validate NoSQL query parameters
export const validateNoSQLQuery = [
    check('query')
        .optional()
        .isObject().withMessage('Query should be a valid JSON object'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware to validate NoSQL data structure
export const validateNoSQLData = (requiredFields) => [
    check('data')
        .notEmpty().withMessage('Data is required')
        .isObject().withMessage('Data should be a valid JSON object')
        .custom(data => {
            // Check if all required fields are present in the data
            const missingFields = requiredFields.filter(field => !(field in data));
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }
            return true;
        })
        .custom(data => Object.keys(data).length > 0)
        .withMessage('Data cannot be an empty object'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware for creating NoSQL documents
export const validateNoSqlCreate = [
    check('collection')
        .notEmpty().withMessage('Collection name is required')
        .isString().withMessage('Collection name must be a string'),
    
    check('document')
        .notEmpty().withMessage('Document is required')
        .isObject().withMessage('Document should be a valid JSON object')
        .custom(doc => {
            const requiredFields = ['name', 'value'];
            const missingFields = requiredFields.filter(field => !(field in doc));
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }
            return true;
        })
        .custom(doc => Object.keys(doc).length > 0)
        .withMessage('Document cannot be an empty object'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware for updating NoSQL documents
export const validateNoSqlUpdate = [
    check('collection')
        .notEmpty().withMessage('Collection name is required')
        .isString().withMessage('Collection name must be a string'),

    check('document')
        .notEmpty().withMessage('Document is required')
        .isObject().withMessage('Document should be a valid JSON object')
        .custom(doc => {
            if (!doc._id) {
                throw new Error('Document must have an identifier field (_id)');
            }
            return true;
        })
        .custom(doc => Object.keys(doc).length > 0)
        .withMessage('Document cannot be an empty object'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Central validation middleware to route to SQL or NoSQL validation
export const validateRequest = (req, res, next) => {
    const { dbType } = req.params;

    if (dbType === 'sql') {
        return validateSQLRequest(req, res, next);
    } else if (dbType === 'nosql') {
        return validateNoSQLRequest(req, res, next);
    } else {
        return res.status(400).json({ error: 'Invalid dbType parameter' });
    }
};



// Middleware to validate NoSQL schema structure


// Middleware to validate NoSQL input (new functionality)


// Middleware to validate SQL input (new functionality)
export const validateSQLInput = [
    check('tableName')
        .notEmpty().withMessage('Table name is required')
        .isString().withMessage('Table name must be a string'),

    check('data')
        .notEmpty().withMessage('Data is required')
        .isObject().withMessage('Data should be a valid JSON object')
        .custom(data => {
            // Ensure data matches the expected schema for the table
            const requiredFields = ['column1', 'column2']; // Adjust this according to your table's schema
            const missingFields = requiredFields.filter(field => !(field in data));
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }
            return true;
        })
        .custom(data => Object.keys(data).length > 0)
        .withMessage('Data cannot be an empty object'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware to validate SQL schema (new functionality)
export const validateSQLSchema = [
    check('schema')
        .isArray().withMessage('Schema should be an array of column definitions')
        .custom(schema =>
            schema.every(col =>
                typeof col.name === 'string' &&
                typeof col.type === 'string'
            )
        ).withMessage('Each column should have a name and type as strings'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateSQLData = [
    // Validate required fields and their types
    body('name').isString().withMessage('Name must be a string').notEmpty().withMessage('Name is required'),
    body('age').isInt({ min: 18 }).withMessage('Age must be an integer and at least 18'),
    body('email').isEmail().withMessage('Email must be a valid email address').notEmpty().withMessage('Email is required'),
    body('address').optional().isString().withMessage('Address must be a string'),

    // Middleware to check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next(); // Proceed if validation passes
    }
];

export const validateMigrationRequest = [
    check('sourceDB')
        .notEmpty().withMessage('Source database is required')
        .isIn(['sql', 'nosql']).withMessage('Source database must be either "sql" or "nosql"'),

    check('destinationDB')
        .notEmpty().withMessage('Destination database is required')
        .isIn(['mysql', 'mongodb']).withMessage('Destination database must be either "mysql" or "mongodb"'),

    check('migrationType')
        .notEmpty().withMessage('Migration type is required')
        .isIn(['data', 'schema', 'full']).withMessage('Migration type must be one of "data", "schema", or "full"'),

    check('migrationData')
        .optional()
        .isObject().withMessage('Migration data should be a valid JSON object')
        .custom(data => Object.keys(data).length > 0)
        .withMessage('Migration data cannot be an empty object'),

    check('sourceDBConfig')
        .notEmpty().withMessage('Source database configuration is required')
        .isObject().withMessage('Source database configuration should be a valid JSON object')
        .custom(config => {
            // Validate SQL source database config
            if (config.type === 'sql') {
                if (!config.host || !config.user || !config.password || !config.database) {
                    throw new Error('Source SQL database configuration requires host, user, password, and database');
                }
            }
            // Validate NoSQL source database config
            else if (config.type === 'nosql') {
                if (!config.uri) {
                    throw new Error('Source NoSQL database requires URI');
                }
            }
            return true;
        }),

    check('destinationDBConfig')
        .notEmpty().withMessage('Destination database configuration is required')
        .isObject().withMessage('Destination database configuration should be a valid JSON object')
        .custom(config => {
            // Validate MySQL destination database config
            if (config.type === 'mysql') {
                if (!config.host || !config.user || !config.password || !config.database) {
                    throw new Error('Destination MySQL database configuration requires host, user, password, and database');
                }
            }
            // Validate MongoDB destination database config
            else if (config.type === 'mongodb') {
                if (!config.uri || !config.database) {
                    throw new Error('Destination MongoDB database requires URI and database name');
                }
            }
            return true;
        }),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export function validateClusterCreation(clusterName, storagePath, existingClusters) {
    try {
        // Check if both clusterName and storagePath are provided
        if (!clusterName || !storagePath) {
            throw new Error('Both cluster name and storage path must be provided.');
        }

        // Check if the storage path already exists
        if (existsSync(storagePath)) {
            throw new Error(`Storage path already exists: ${storagePath}`);
        }

        // Check if clusterName is already used by another cluster
        const isClusterNameTaken = existingClusters.some(cluster => cluster.name === clusterName);
        if (isClusterNameTaken) {
            throw new Error(`Cluster name "${clusterName}" is already taken.`);
        }

        // Ensure the storage path is a valid directory path
        if (!existsSync(storagePath)) {
            _error(`Invalid storage path: ${storagePath}`);
            throw new Error(`The storage path "${storagePath}" is invalid.`);
        }

        // Validation passed, return true
        info('Cluster creation validated successfully.');
        return true;
    } catch (error) {
        _error('Cluster creation validation failed:', error);
        throw error;  // Re-throw error to be handled by controller
    }
}

export function validateClusterId(clusterId, clusters) {
    try {
        // Check if the provided clusterId is valid
        const cluster = clusters.find(cluster => cluster.id === parseInt(clusterId));

        if (!cluster) {
            throw new Error(`Cluster with ID ${clusterId} not found.`);
        }

        // Ensure the cluster path exists
        const clusterPath = join(cluster.path);
        if (!existsSync(clusterPath)) {
            throw new Error(`Cluster path not found at: ${clusterPath}`);
        }

        // Validation passed, return the cluster object
        info(`Cluster with ID ${clusterId} validated successfully.`);
        return cluster;
    } catch (error) {
        _error('Cluster ID validation failed:', error);
        throw error;  // Re-throw error to be handled by controller
    }
}

export function validateClusterUpdate(clusterId, updatedData, clusters) {
    try {
        const { clusterName, storagePath } = updatedData;

        // Find the cluster by ID
        const existingCluster = clusters.find(cluster => cluster.id === parseInt(clusterId));
        
        if (!existingCluster) {
            throw new Error(`Cluster with ID ${clusterId} not found.`);
        }

        // Validate the new cluster name (it should not already exist)
        const isClusterNameTaken = clusters.some(cluster => cluster.name === clusterName && cluster.id !== parseInt(clusterId));

        if (isClusterNameTaken) {
            throw new Error(`Cluster name "${clusterName}" is already taken.`);
        }

        // Validate the new storage path (if provided)
        if (storagePath && !existsSync(join(storagePath))) {
            throw new Error(`Cluster storage path not found at: ${storagePath}`);
        }

        // If the storage path was updated, ensure that the path exists
        if (storagePath && storagePath !== existingCluster.storagePath) {
            const newClusterPath = join(storagePath);
            if (!existsSync(newClusterPath)) {
                throw new Error(`The provided storage path "${storagePath}" does not exist.`);
            }
        }

        info(`Cluster update validated successfully for ID: ${clusterId}`);
        return true;  // Validation passed
    } catch (error) {
        _error('Cluster update validation failed:', error);
        throw error;  // Re-throw error to be handled by controller
    }
}