// src/backend/config/ClusterConfig.js

// Import required modules for environment-based configuration (optional)
import dotenv from 'dotenv';
dotenv.config();
import { join } from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..', '..');

// Cluster Configuration
const ClusterConfig = {
    // Root directory for cluster storage
    basePath: join(__dirname, '../../data/clusters'),

    // Number of clusters to be created and managed
    clusterCount: process.env.CLUSTER_COUNT || 3,  // Default to 3 clusters if not specified

    // Storage paths for individual clusters
    clusters: Array.from({ length: process.env.CLUSTER_COUNT || 3 }, (_, index) => ({
        id: index + 1,
        path: join(__dirname, `../../data/clusters/cluster${index + 1}`)
    })),

    // Cluster Strategy
    strategy: process.env.CLUSTER_STRATEGY || 'round-robin',  // Options: 'round-robin', 'load-balancing', 'hashing'

    // Replication Settings
    replication: {
        enabled: process.env.CLUSTER_REPLICATION_ENABLED === 'true',  // Enable replication for fault tolerance
        factor: process.env.REPLICATION_FACTOR || 1,  // Number of replicas per data item
    },

    // Storage Quota Settings (in MB)
    storageQuota: {
        enabled: process.env.STORAGE_QUOTA_ENABLED === 'true',
        quotaPerCluster: process.env.STORAGE_QUOTA || 500,  // Default quota of 500MB per cluster
    },

    // Data Allocation Strategy: Function to decide which cluster to use for new data
    dataAllocationStrategy: (data) => {
        // Implement round-robin strategy as default
        let clusterId = 1; // Default to the first cluster
        if (ClusterConfig.strategy === 'round-robin') {
            clusterId = (data.id % ClusterConfig.clusterCount) + 1;
        } else if (ClusterConfig.strategy === 'load-balancing') {
            // Load balancing can be implemented based on free space checks in each cluster
            clusterId = findClusterWithMostFreeSpace();
        } else if (ClusterConfig.strategy === 'hashing') {
            // Basic hashing mechanism for distributing data
            clusterId = hashData(data) % ClusterConfig.clusterCount + 1;
        }
        return ClusterConfig.clusters.find(c => c.id === clusterId);
    }
};

// Helper Functions

// Example helper function for hashing data (simple hash for demo purposes)
function hashData(data) {
    let hash = 0;
    const stringData = JSON.stringify(data);
    for (let i = 0; i < stringData.length; i++) {
        const char = stringData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

// Example function for finding cluster with the most free space (load balancing)
function findClusterWithMostFreeSpace() {
    // In a real-world application, implement logic to check available space in each cluster
    // Here, we'll mock it to return a random cluster
    const randomCluster = Math.floor(Math.random() * ClusterConfig.clusterCount) + 1;
    return randomCluster;
}

export default ClusterConfig;
