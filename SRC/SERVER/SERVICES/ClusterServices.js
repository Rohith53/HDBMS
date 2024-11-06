// src/backend/services/clusterService.js

const path = require('path');
const fs = require('fs');
const ClusterModule = require('../MODULES/ClusterModule.js');
const logger = require('../UTILS/Logger.js');

// Configuration for clusters (imported from config)
const { CLUSTER_PATHS, REDUNDANCY_LEVEL } = require('../CONFIG/DbConfig.js');

class ClusterService {
  
  // Initializes clusters based on the configuration file
  static async initializeClusters() {
    try {
      // Ensure each cluster path exists, create if not
      for (let clusterPath of CLUSTER_PATHS) {
        if (!fs.existsSync(clusterPath)) {
          fs.mkdirSync(clusterPath, { recursive: true });
          logger.info(`Cluster path ${clusterPath} created successfully.`);
        }
      }
    } catch (error) {
      logger.error('Failed to initialize clusters:', error);
      throw new Error('Cluster Initialization Failed');
    }
  }

  // Create a new cluster for specific storage needs
  static async createCluster(clusterName) {
    try {
      const newClusterPath = path.join(CLUSTER_PATHS.basePath, clusterName);
      if (!fs.existsSync(newClusterPath)) {
        fs.mkdirSync(newClusterPath);
        logger.info(`Cluster ${clusterName} created at ${newClusterPath}`);
      }
      return { clusterName, path: newClusterPath };
    } catch (error) {
      logger.error('Error creating cluster:', error);
      throw new Error('Cluster Creation Failed');
    }
  }

  // Stores data in the best-suited cluster based on load balancing
  static async storeData(data, fileName) {
    try {
      const targetCluster = await ClusterModule.findAvailableCluster(CLUSTER_PATHS);
      const filePath = path.join(targetCluster, fileName);

      fs.writeFileSync(filePath, data);
      logger.info(`Data stored in cluster ${targetCluster} at ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error('Error storing data in cluster:', error);
      throw new Error('Data Storage Failed');
    }
  }

  // Retrieve data from a specified cluster based on file path
  static async retrieveData(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        logger.info(`Data retrieved from ${filePath}`);
        return data;
      } else {
        logger.warn(`Data not found at ${filePath}`);
        throw new Error('Data Not Found');
      }
    } catch (error) {
      logger.error('Error retrieving data:', error);
      throw new Error('Data Retrieval Failed');
    }
  }

  // Delete data from a specific cluster
  static async deleteData(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Data deleted from ${filePath}`);
      } else {
        logger.warn(`Data not found at ${filePath}`);
        throw new Error('Data Not Found');
      }
    } catch (error) {
      logger.error('Error deleting data:', error);
      throw new Error('Data Deletion Failed');
    }
  }

  // Backup data to redundant clusters for fault tolerance
  static async backupData(data, fileName) {
    try {
      let backupPaths = [];
      for (let i = 0; i < REDUNDANCY_LEVEL; i++) {
        const backupCluster = CLUSTER_PATHS[i % CLUSTER_PATHS.length];
        const backupPath = path.join(backupCluster, `backup_${fileName}_${i}`);
        fs.writeFileSync(backupPath, data);
        backupPaths.push(backupPath);
      }
      logger.info(`Data backed up to paths: ${backupPaths.join(', ')}`);
      return backupPaths;
    } catch (error) {
      logger.error('Error during data backup:', error);
      throw new Error('Data Backup Failed');
    }
  }
}

module.exports = ClusterService;
