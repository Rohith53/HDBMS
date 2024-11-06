// src/backend/models/migrationModel.js

import { Schema, model } from 'mongoose';

// Define the schema for tracking migration details
const migrationSchema = new Schema({
    sourceDb: {
        type: String,
        required: true,
        enum: ['SQL', 'NoSQL'], // Specify types of source databases
    },
    destinationDb: {
        type: String,
        required: true,
        enum: ['MySQL', 'MongoDB'], // Specify types of destination databases
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Completed', 'Failed'], // Migration status
        default: 'Pending',
    },
    errorLog: {
        type: String,
        default: null, // Log any errors that occur during migration
    },
    startedAt: {
        type: Date,
        default: Date.now, // Timestamp for when the migration starts
    },
    completedAt: {
        type: Date,
        default: null, // Timestamp for when the migration completes
    },
    migrationData: {
        type: Object,
        required: true, // Store migration data for processing
    },
});

// Create the model from the schema
const Migration = model('Migration', migrationSchema);

export default Migration;
