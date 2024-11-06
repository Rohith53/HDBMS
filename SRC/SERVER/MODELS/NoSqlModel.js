// src/backend/models/nosqlModel.js

import mongoose from 'mongoose'; // Import Mongoose for MongoDB interaction

// Connect to the NoSQL database (MongoDB)
const connectToDatabase = () => {
    const uri = process.env.NOSQL_DB_URI || 'mongodb://localhost:27017/hdbms'; // MongoDB URI
    return mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

// Define a NoSQL schema for documents
const noSqlSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Create a model based on the schema
const NoSQLModel = mongoose.model('NoSQLDocument', noSqlSchema);

// Function to create a new document
export const createDocument = async (data) => {
    const document = new NoSQLModel(data);
    return await document.save(); // Save the document to the database
};

// Function to find documents based on conditions
export const findDocuments = async (conditions = {}) => {
    return await NoSQLModel.find(conditions).exec(); // Query documents based on conditions
};

// Function to find a single document based on conditions
export const findOne = async (conditions = {}) => {
    return await NoSQLModel.findOne(conditions).exec(); // Find one document based on conditions
};

// Function to find a document by ID
export const findById = async (id) => {
    return await NoSQLModel.findById(id).exec(); // Find a document by ID
};

// Function to find multiple documents based on conditions
export const find = async (conditions = {}, projection = null, options = {}) => {
    return await NoSQLModel.find(conditions, projection, options).exec(); // Find documents based on conditions
};

// Function to update a document by ID
export const updateDocumentById = async (id, data) => {
    return await NoSQLModel.findByIdAndUpdate(id, { ...data, updatedAt: Date.now() }, { new: true }).exec();
};

// Function to delete a document by ID
export const deleteDocumentById = async (id) => {
    return await NoSQLModel.findByIdAndDelete(id).exec(); // Delete document by ID
};

// Function to close the database connection (optional)
export const closeConnection = () => {
    mongoose.connection.close(err => {
        if (err) {
            console.error('Error closing the NoSQL database connection:', err);
        } else {
            console.log('NoSQL database connection closed.');
        }
    });
};

// Connect to the NoSQL database on module load
connectToDatabase()
    .then(() => console.log('Connected to NoSQL database'))
    .catch(err => console.error('Error connecting to NoSQL database:', err));

// Export model and functions
export default {
    createDocument,
    findDocuments,
    findOne,
    findById,
    find, // Added the find function
    updateDocumentById,
    deleteDocumentById,
    closeConnection,
};
