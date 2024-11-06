// src/backend/controllers/nosqlController.js

import { 
    createDocument as createNoSqlDocument, 
    getDocuments as fetchNoSqlDocuments, 
    updateDocument, 
    deleteDocument as deleteNoSqlDocument, 
    migrateData as migrateNoSqlData 
} from '../SERVICES/NoSqlServices.js';
import { validateNoSQLData } from '../MIDDLEWARE/ValidationMiddleware.js';

// Create a new document in the NoSQL database
export async function createDocumentController(req, res) {
    try {
        const validatedData = validateNoSQLData(req.body);
        const newDocument = await createNoSqlDocument(validatedData);
        res.status(201).json(newDocument);
    } catch (error) {
        res.status(500).json({ message: 'Error creating document', error: error.message });
    }
}

// Retrieve documents from the NoSQL database
export async function getDocumentsController(req, res) {
    try {
        const documents = await fetchNoSqlDocuments(req.query);
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving documents', error: error.message });
    }
}

// Update a document in the NoSQL database
export async function updateDocumentController(req, res) {
    try {
        const validatedData = validateNoSQLData(req.body);
        const updatedDocument = await updateDocument(req.params.id, validatedData);
        if (!updatedDocument) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.status(200).json(updatedDocument);
    } catch (error) {
        res.status(500).json({ message: 'Error updating document', error: error.message });
    }
}

// Delete a document from the NoSQL database
export async function deleteDocumentController(req, res) {
    try {
        const deletedDocument = await deleteNoSqlDocument(req.params.id);
        if (!deletedDocument) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.status(204).send(); // No content to return
    } catch (error) {
        res.status(500).json({ message: 'Error deleting document', error: error.message });
    }
}

// Migrate data from NoSQL to MongoDB
export async function migrateDataController(req, res) {
    try {
        const migrationResult = await migrateNoSqlData(req.body);
        res.status(200).json(migrationResult);
    } catch (error) {
        res.status(500).json({ message: 'Error migrating data', error: error.message });
    }
}
