// src/backend/utils/fileStorage.js

import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';

// Base directory for storing data
const baseDataDir = join(__dirname, '../../data');

// Create necessary directories if they don't exist
const createDataDirectories = () => {
    const sqlDir = join(baseDataDir, 'sql_data');
    const nosqlDir = join(baseDataDir, 'nosql_data');

    if (!existsSync(sqlDir)) {
        mkdirSync(sqlDir, { recursive: true });
    }
    if (!existsSync(nosqlDir)) {
        mkdirSync(nosqlDir, { recursive: true });
    }
};

// Function to write data to a file
const writeToFile = (filename, data) => {
    const filePath = join(baseDataDir, filename);
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Function to read data from a file
const readFromFile = (filename) => {
    const filePath = join(baseDataDir, filename);
    if (existsSync(filePath)) {
        const data = readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }
    return null; // Return null if file doesn't exist
};

// Function to delete a file
const deleteFile = (filename) => {
    const filePath = join(baseDataDir, filename);
    if (existsSync(filePath)) {
        unlinkSync(filePath);
    }
};

// Function to list files in a directory
const listFiles = (dir) => {
    const dirPath = join(baseDataDir, dir);
    if (existsSync(dirPath)) {
        return readdirSync(dirPath);
    }
    return []; // Return an empty array if directory doesn't exist
};

// Initialize the file storage
const initializeFileStorage = () => {
    createDataDirectories();
};

export default {
    initializeFileStorage,
    writeToFile,
    readFromFile,
    deleteFile,
    listFiles,
};
