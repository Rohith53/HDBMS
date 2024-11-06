// src/backend/config/serverConfig.js

// Load environment variables from .env file for local development
import dotenv from 'dotenv';
dotenv.config();

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Use `import.meta.url` to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const env = process.env.NODE_ENV || 'development';
export const isProduction = env === 'production';

export const serverConfig = {
  environment: env,
  port: process.env.PORT || 5000,
  host: process.env.HOST || 'localhost',

  // CORS settings - adjust the origin as needed for security
  corsOptions: {
    origin: process.env.CORS_ORIGIN || '*',  // Restrict in production to specific domains
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  },

  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || (isProduction ? 'warn' : 'info'),
  },

  // Paths for SQL and NoSQL storage and migrations
  paths: {
    baseDir: resolve(__dirname, '../../../data'), // Root data directory
    sqlDataDir: resolve(__dirname, '../../../data/sql_data'),
    nosqlDataDir: resolve(__dirname, '../../../data/nosql_data'),
    sqlMigrationDir: resolve(__dirname, '../../../data/migrations/sqlMigrations'),
    nosqlMigrationDir: resolve(__dirname, '../../../data/migrations/noSqlMigrations'),
  },

  // Cluster settings
  cluster: {
    enabled: process.env.CLUSTER_ENABLED === 'true',  // Enable or disable cluster storage
    maxClusterNodes: parseInt(process.env.MAX_CLUSTER_NODES, 10) || 5,
  },

  // Migration options for SQL to MySQL and NoSQL to MongoDB
  migration: {
    sqlToMySQL: {
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'password',
      database: process.env.MYSQL_DATABASE || 'hdbms_sql',
    },
    noSQLToMongoDB: {
      host: process.env.MONGODB_HOST || 'localhost',
      user: process.env.MONGODB_USER || 'admin',
      password: process.env.MONGODB_PASSWORD || 'password',
      database: process.env.MONGODB_DATABASE || 'hdbms_nosql',
    },
  },

  // Security settings - enhance for production
  security: {
    enableCors: process.env.ENABLE_CORS === 'true',
    enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
  },
};

export default serverConfig;
