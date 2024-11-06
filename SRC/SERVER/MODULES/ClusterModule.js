// src/backend/modules/ClusterModule.js

import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, readdirSync, rmdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import clusterConfig from '../CONFIG/ClusterConfig.js';
import { info, error as _error, warn } from '../UTILS/Logger.js';

class ClusterModule {
    constructor() {
        this.clusters = [];
        try {
            const { clusterPaths, replicationFactor } = clusterConfig;

            // Create cluster directories if they don't exist
            clusterPaths.forEach((clusterPath, index) => {
                if (!existsSync(clusterPath)) {
                    mkdirSync(clusterPath, { recursive: true });
                }
                this.clusters.push({ path: clusterPath, id: index });
            });

            this.replicationFactor = replicationFactor;
            info('Clusters initialized successfully');
        } catch (error) {
            _error('Error initializing clusters:', error);
            throw new Error('Cluster initialization failed');
        }
    }

    selectCluster(dataId) {
        const clusterIndex = dataId % this.clusters.length;
        return this.clusters[clusterIndex];
    }

    async storeData(dataId, dataContent) {
        try {
            const primaryCluster = this.selectCluster(dataId);
            const primaryPath = join(primaryCluster.path, `${dataId}.json`);
            writeFileSync(primaryPath, JSON.stringify(dataContent));
            info(`Data stored in primary cluster: ${primaryPath}`);

            this.replicateData(dataId, dataContent, primaryCluster.id);
        } catch (error) {
            _error('Error storing data:', error);
            throw new Error('Data storage failed');
        }
    }

    replicateData(dataId, dataContent, primaryClusterId) {
        const replicationClusters = this.clusters.filter(cluster => cluster.id !== primaryClusterId);
        const replicas = replicationClusters.slice(0, this.replicationFactor - 1);

        replicas.forEach((replicaCluster) => {
            const replicaPath = join(replicaCluster.path, `${dataId}.json`);
            writeFileSync(replicaPath, JSON.stringify(dataContent));
            info(`Data replicated in cluster: ${replicaPath}`);
        });
    }

    retrieveData(dataId) {
        for (const cluster of this.clusters) {
            const dataPath = join(cluster.path, `${dataId}.json`);
            if (existsSync(dataPath)) {
                const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
                info(`Data retrieved from cluster: ${dataPath}`);
                return data;
            }
        }
        warn(`Data with ID ${dataId} not found in any cluster`);
        throw new Error('Data not found');
    }

    deleteData(dataId) {
        this.clusters.forEach(cluster => {
            const dataPath = join(cluster.path, `${dataId}.json`);
            if (existsSync(dataPath)) {
                unlinkSync(dataPath);
                info(`Data deleted from cluster: ${dataPath}`);
            }
        });
    }

    addCluster(newClusterPath) {
        if (!existsSync(newClusterPath)) {
            mkdirSync(newClusterPath, { recursive: true });
        }
        const newCluster = { path: newClusterPath, id: this.clusters.length };
        this.clusters.push(newCluster);
        info(`New cluster added at path: ${newClusterPath}`);
    }

    removeCluster(clusterId) {
        const clusterToRemove = this.clusters.find(cluster => cluster.id === clusterId);
        if (!clusterToRemove) throw new Error(`Cluster with ID ${clusterId} not found`);

        const remainingClusters = this.clusters.filter(cluster => cluster.id !== clusterId);

        // Redistribute data before removing
        readdirSync(clusterToRemove.path).forEach(file => {
            const dataId = basename(file, '.json');
            const data = JSON.parse(readFileSync(join(clusterToRemove.path, file), 'utf-8'));
            this.storeData(dataId, data); // Redistribute
            unlinkSync(join(clusterToRemove.path, file));
        });

        this.clusters = remainingClusters;
        rmdirSync(clusterToRemove.path);
        info(`Cluster with ID ${clusterId} removed and data redistributed`);
    }

    getClusterStatus() {
        return this.clusters.map(cluster => ({
            path: cluster.path,
            files: readdirSync(cluster.path).length,
            availableSpace: statSync(cluster.path).size
        }));
    }

    createCluster(clusterPath) {
        if (this.clusters.find(cluster => cluster.path === clusterPath)) {
            throw new Error('Cluster with this path already exists');
        }
        this.addCluster(clusterPath);
        info(`Cluster created at path: ${clusterPath}`);
    }

    getClusters() {
        return this.clusters;
    }

    getClusterById(clusterId) {
        const cluster = this.clusters.find(cluster => cluster.id === clusterId);
        if (!cluster) {
            throw new Error(`Cluster with ID ${clusterId} not found`);
        }
        return cluster;
    }

    updateCluster(clusterId, newPath) {
        const cluster = this.clusters.find(cluster => cluster.id === clusterId);
        if (!cluster) {
            throw new Error(`Cluster with ID ${clusterId} not found`);
        }

        const oldPath = cluster.path;
        cluster.path = newPath;

        if (existsSync(newPath)) {
            throw new Error(`Cluster path already exists`);
        }

        if (existsSync(oldPath)) {
            mkdirSync(newPath, { recursive: true });
            readdirSync(oldPath).forEach(file => {
                const oldFilePath = join(oldPath, file);
                const newFilePath = join(newPath, file);
                writeFileSync(newFilePath, readFileSync(oldFilePath, 'utf-8'));
                unlinkSync(oldFilePath);
            });
            rmdirSync(oldPath);
        }

        info(`Cluster with ID ${clusterId} updated to new path: ${newPath}`);
    }

    deleteCluster(clusterId) {
        const cluster = this.clusters.find(cluster => cluster.id === clusterId);
        if (!cluster) {
            throw new Error(`Cluster with ID ${clusterId} not found`);
        }
        this.removeCluster(clusterId);
        info(`Cluster with ID ${clusterId} deleted`);
    }
}

// Exporting individual functions for use elsewhere
export const selectCluster = (dataId) => {
    const clusterIndex = dataId % ClusterModule.clusters.length;
    return ClusterModule.clusters[clusterIndex];
};

export const storeData = async (dataId, dataContent) => {
    try {
        const primaryCluster = selectCluster(dataId);
        const primaryPath = join(primaryCluster.path, `${dataId}.json`);
        writeFileSync(primaryPath, JSON.stringify(dataContent));
        info(`Data stored in primary cluster: ${primaryPath}`);

        ClusterModule.replicateData(dataId, dataContent, primaryCluster.id);
    } catch (error) {
        _error('Error storing data:', error);
        throw new Error('Data storage failed');
    }
};

export const replicateData = (dataId, dataContent, primaryClusterId) => {
    const replicationClusters = ClusterModule.clusters.filter(cluster => cluster.id !== primaryClusterId);
    const replicas = replicationClusters.slice(0, ClusterModule.replicationFactor - 1);

    replicas.forEach((replicaCluster) => {
        const replicaPath = join(replicaCluster.path, `${dataId}.json`);
        writeFileSync(replicaPath, JSON.stringify(dataContent));
        info(`Data replicated in cluster: ${replicaPath}`);
    });
};

export const retrieveData = (dataId) => {
    for (const cluster of ClusterModule.clusters) {
        const dataPath = join(cluster.path, `${dataId}.json`);
        if (existsSync(dataPath)) {
            const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
            info(`Data retrieved from cluster: ${dataPath}`);
            return data;
        }
    }
    warn(`Data with ID ${dataId} not found in any cluster`);
    throw new Error('Data not found');
};

export const deleteData = (dataId) => {
    ClusterModule.clusters.forEach(cluster => {
        const dataPath = join(cluster.path, `${dataId}.json`);
        if (existsSync(dataPath)) {
            unlinkSync(dataPath);
            info(`Data deleted from cluster: ${dataPath}`);
        }
    });
};

export const addCluster = (newClusterPath) => {
    if (!existsSync(newClusterPath)) {
        mkdirSync(newClusterPath, { recursive: true });
    }
    const newCluster = { path: newClusterPath, id: ClusterModule.clusters.length };
    ClusterModule.clusters.push(newCluster);
    info(`New cluster added at path: ${newClusterPath}`);
};

export const removeCluster = (clusterId) => {
    const clusterToRemove = ClusterModule.clusters.find(cluster => cluster.id === clusterId);
    if (!clusterToRemove) throw new Error(`Cluster with ID ${clusterId} not found`);

    const remainingClusters = ClusterModule.clusters.filter(cluster => cluster.id !== clusterId);

    readdirSync(clusterToRemove.path).forEach(file => {
        const dataId = basename(file, '.json');
        const data = JSON.parse(readFileSync(join(clusterToRemove.path, file), 'utf-8'));
        storeData(dataId, data); // Redistribute
        unlinkSync(join(clusterToRemove.path, file));
    });

    ClusterModule.clusters = remainingClusters;
    rmdirSync(clusterToRemove.path);
    info(`Cluster with ID ${clusterId} removed and data redistributed`);
};

export const getClusterStatus = () => {
    return ClusterModule.clusters.map(cluster => ({
        path: cluster.path,
        files: readdirSync(cluster.path).length,
        availableSpace: statSync(cluster.path).size
    }));
};

export const createCluster = (clusterPath) => {
    if (ClusterModule.clusters.find(cluster => cluster.path === clusterPath)) {
        throw new Error('Cluster with this path already exists');
    }
    addCluster(clusterPath);
    info(`Cluster created at path: ${clusterPath}`);
};

export const getClusters = () => {
    return ClusterModule.clusters;
};

export const getClusterById = (clusterId) => {
    const cluster = ClusterModule.clusters.find(cluster => cluster.id === clusterId);
    if (!cluster) {
        throw new Error(`Cluster with ID ${clusterId} not found`);
    }
    return cluster;
};

export const updateCluster = (clusterId, newPath) => {
    const cluster = ClusterModule.clusters.find(cluster => cluster.id === clusterId);
    if (!cluster) {
        throw new Error(`Cluster with ID ${clusterId} not found`);
    }

    const oldPath = cluster.path;
    cluster.path = newPath;

    if (existsSync(newPath)) {
        throw new Error(`Cluster path already exists`);
    }

    if (existsSync(oldPath)) {
        mkdirSync(newPath, { recursive: true });
        readdirSync(oldPath).forEach(file => {
            const oldFilePath = join(oldPath, file);
            const newFilePath = join(newPath, file);
            writeFileSync(newFilePath, readFileSync(oldFilePath, 'utf-8'));
            unlinkSync(oldFilePath);
        });
        rmdirSync(oldPath);
    }

    info(`Cluster with ID ${clusterId} updated to new path: ${newPath}`);
};

export const deleteCluster = (clusterId) => {
    const cluster = ClusterModule.clusters.find(cluster => cluster.id === clusterId);
    if (!cluster) {
        throw new Error(`Cluster with ID ${clusterId} not found`);
    }
    removeCluster(clusterId);
    info(`Cluster with ID ${clusterId} deleted`);
};

// Export the entire ClusterModule class as default
export default ClusterModule;

