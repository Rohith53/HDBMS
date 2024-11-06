// server.js

// Import necessary modules
import express, { json } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './MIDDLEWARE/ErrorHandler.js';
import { serverConfig , env as ENV } from './CONFIG/ServerConfig.js';
import sqlRoutes from './ROUTES/SqlRoutes.js';
import nosqlRoutes from './ROUTES/NoSqlRoutes.js';
import dataConversionRoutes from './ROUTES/DataConversionRoutes.js';
import clusterRoutes from './ROUTES/ClusterRoutes.js';
import sqlMigrationRoutes from './ROUTES/SqlMigrationRoutes.js';
import nosqlMigrationRoutes from './ROUTES/NoSqlMigrationRoutes.js';

const app = express();

// Middleware for JSON parsing
app.use(json());

// CORS setup for cross-origin requests
app.use(cors());

// Request logging (only for development environment)
if (ENV === 'development') {
  app.use(morgan('dev'));
}

// Route Setup
// SQL Routes for CRUD operations
app.use('/api/sql', sqlRoutes);

// NoSQL Routes for CRUD operations
app.use('/api/nosql', nosqlRoutes);

// Data Conversion Routes for SQL <-> NoSQL data conversions
app.use('/api/convert', dataConversionRoutes);

// Cluster Management Routes
app.use('/api/cluster', clusterRoutes);

// SQL Migration Routes (SQL to MySQL)
app.use('/api/sql-migrate', sqlMigrationRoutes);

// NoSQL Migration Routes (NoSQL to MongoDB)
app.use('/api/nosql-migrate', nosqlMigrationRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on port ${serverConfig.port} in ${ENV} mode`);
});

// Export the app for testing purposes
export default app;
