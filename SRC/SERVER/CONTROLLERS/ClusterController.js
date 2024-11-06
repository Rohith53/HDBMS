// src/backend/controllers/clusterController.js

import { createCluster as CreateCluster, 
    getClusters as GetClusters,
     getClusterById as GetClusterById,
      updateCluster as UpdateCluster,
       deleteCluster as DeleteCluster} from '../MODULES/ClusterModule.js';
import { errorHandler as handleError } from '../MIDDLEWARE/ErrorHandler.js';

// Create a new cluster
export async function createCluster(req, res) {
    try {
        const { clusterName, storagePath } = req.body;
        const newCluster = await CreateCluster(clusterName, storagePath);
        return res.status(201).json({ success: true, data: newCluster });
    } catch (error) {
        handleError(res, error);
    }
}

// Get information about all clusters
export async function getClusters(req, res) {
    try {
        const clusters = await GetClusters();
        return res.status(200).json({ success: true, data: clusters });
    } catch (error) {
        handleError(res, error);
    }
}

// Get information about a specific cluster
export async function getClusterById(req, res) {
    try {
        const { id } = req.params;
        const cluster = await GetClusterById(id);
        if (!cluster) {
            return res.status(404).json({ success: false, message: 'Cluster not found' });
        }
        return res.status(200).json({ success: true, data: cluster });
    } catch (error) {
        handleError(res, error);
    }
}

// Update cluster information
export async function updateCluster(req, res) {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const updatedCluster = await UpdateCluster(id, updatedData);
        if (!updatedCluster) {
            return res.status(404).json({ success: false, message: 'Cluster not found' });
        }
        return res.status(200).json({ success: true, data: updatedCluster });
    } catch (error) {
        handleError(res, error);
    }
}

// Delete a cluster
export async function deleteCluster(req, res) {
    try {
        const { id } = req.params;
        const deletedCluster = await DeleteCluster(id);
        if (!deletedCluster) {
            return res.status(404).json({ success: false, message: 'Cluster not found' });
        }
        return res.status(200).json({ success: true, message: 'Cluster deleted successfully' });
    } catch (error) {
        handleError(res, error);
    }
}

