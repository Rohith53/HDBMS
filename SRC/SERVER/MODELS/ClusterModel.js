// src/backend/models/clusterModel.js
import { Schema, model } from 'mongoose';

// Define the Cluster Schema
const clusterSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    capacity: {
        type: Number,
        required: true, // Maximum capacity for the cluster
    },
    storagePath: {
        type: String,
        required: true, // Path where cluster data is stored
    },
    currentLoad: {
        type: Number,
        default: 0, // Current data load in the cluster
    },
    createdAt: {
        type: Date,
        default: Date.now, // Timestamp of cluster creation
    },
});

// Method to add data to the cluster
clusterSchema.methods.addData = function (dataSize) {
    if (this.currentLoad + dataSize <= this.capacity) {
        this.currentLoad += dataSize;
        return true; // Data added successfully
    }
    return false; // Not enough capacity
};

// Method to remove data from the cluster
clusterSchema.methods.removeData = function (dataSize) {
    if (this.currentLoad - dataSize >= 0) {
        this.currentLoad -= dataSize;
        return true; // Data removed successfully
    }
    return false; // Not enough data to remove
};

// Create the Cluster model
const Cluster = model('Cluster', clusterSchema);

export default Cluster;
