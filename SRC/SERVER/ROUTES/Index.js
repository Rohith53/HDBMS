// src/backend/routes/index.js

const express = require('express');
const router = express.Router();

// Importing individual route files for different functionalities
const sqlRoutes = require('./SqlRoutes.js').default;
const nosqlRoutes = require('./NoSqlRoutes.js').default;
const dataConversionRoutes = require('./DataConversionRoutes.js').default;
const clusterRoutes = require('./ClusterRoutes.js');
const sqlMigrationRoutes = require('./SqlMigrationRoutes.js');
const nosqlMigrationRoutes = require('./NoSqlMigrationRoutes.js');

// Mount each route on a specific path
// SQL CRUD operations
router.use('/sql', sqlRoutes);

// NoSQL CRUD operations
router.use('/nosql', nosqlRoutes);

// Data Conversion (SQL <-> NoSQL) operations
router.use('/convert', dataConversionRoutes);

// Cluster Management operations
router.use('/cluster', clusterRoutes);

// SQL to MySQL data migration operations
router.use('/migrate/sql', sqlMigrationRoutes);

// NoSQL to MongoDB data migration operations
router.use('/migrate/nosql', nosqlMigrationRoutes);

// Exporting the router to be used in server.js
module.exports = router;
