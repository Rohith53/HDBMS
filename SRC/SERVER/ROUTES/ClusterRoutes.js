// Import necessary modules
import { Router } from 'express';
const router = Router();

// Import the cluster controller
import { createCluster, getClusters as getAllClusters, getClusterById, updateCluster, deleteCluster } from '../CONTROLLERS/ClusterController.js';

// Import validation middleware
import { validateClusterCreation, validateClusterId, validateClusterUpdate } from '../MIDDLEWARE/ValidationMiddleware.js';

// Define routes for managing clusters

/**
 * @route POST /clusters
 * @desc Create a new cluster with specified configurations
 * @access Public
 */
router.post(
  '/',
  validateClusterCreation, // Middleware to validate input for creating a cluster
  createCluster
);

/**
 * @route GET /clusters
 * @desc Retrieve a list of all clusters
 * @access Public
 */
router.get(
  '/',
  getAllClusters
);

/**
 * @route GET /clusters/:id
 * @desc Retrieve details of a specific cluster by ID
 * @access Public
 */
router.get(
  '/:id',
  validateClusterId, // Middleware to validate the provided cluster ID
  getClusterById
);

/**
 * @route PUT /clusters/:id
 * @desc Update configuration or storage path of an existing cluster
 * @access Public
 */
router.put(
  '/:id',
  validateClusterUpdate, // Middleware to validate update input
  updateCluster
);

/**
 * @route DELETE /clusters/:id
 * @desc Delete a cluster and its data by ID
 * @access Public
 */
router.delete(
  '/:id',
  validateClusterId, // Middleware to ensure valid cluster ID for deletion
  deleteCluster
);

export default router;
