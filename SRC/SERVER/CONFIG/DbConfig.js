// dbConfig.js

// Load environment variables using dotenv package if needed
import dotenv from 'dotenv';
dotenv.config();
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Define __dirname using `import.meta.url` for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// Configuration for SQL and NoSQL data storage paths and cluster settings
const dbConfig = {
  // SQL Data Storage Path
  sqlDataPath: process.env.SQL_DATA_PATH || resolve(__dirname, '../../DATA/SQLDATA'),

  // NoSQL Data Storage Path
  nosqlDataPath: process.env.NOSQL_DATA_PATH || resolve(__dirname, '../../DATA/NOSQLDATA'),

  // Cluster Settings
  clusterConfig: {
    enabled: process.env.CLUSTER_ENABLED === 'true',  // Enable or disable clustering
    clusterSize: parseInt(process.env.CLUSTER_SIZE, 10) || 3, // Default to 3 clusters if not specified
    replicationFactor: parseInt(process.env.REPLICATION_FACTOR, 10) || 2, // Default replication factor for data
    clusterNodes: [
      // Define paths for each cluster node (can be adjusted based on environment)
      resolve(__dirname, '../../DATA/CLUSTERS/node1'),
      resolve(__dirname, '../../DATA/CLUSTERS/node2'),
      resolve(__dirname, '../../DATA/CLUSTERS/node3')
    ]
  },

  // Log configuration settings (useful for debugging)
  logSettings: () => {
    console.log("Database Configuration:");
    console.log("SQL Data Path:", dbConfig.sqlDataPath);
    console.log("NoSQL Data Path:", dbConfig.nosqlDataPath);
    console.log("Clustering Enabled:", dbConfig.clusterConfig.enabled);
    console.log("Cluster Size:", dbConfig.clusterConfig.clusterSize);
    console.log("Replication Factor:", dbConfig.clusterConfig.replicationFactor);
    console.log("Cluster Nodes:", dbConfig.clusterConfig.clusterNodes);
  }
};

// Optionally call logSettings to verify config on startup
dbConfig.logSettings();

// Export individual properties
export const localSQLStoragePath = dbConfig.sqlDataPath;
export const localNoSQLStoragePath = dbConfig.nosqlDataPath;
export default dbConfig;
