// src/backend/routes/nosqlRoutes.js

import { Router } from 'express';
const router = Router();
import { createDocumentController as createDocument,getDocumentsController as getDocuments,updateDocumentController as updateDocument,deleteDocumentController as deleteDocument } from '../CONTROLLERS/NoSqlController.js';
import { validateNoSqlCreate, validateNoSqlUpdate } from '../MIDDLEWARE/ValidationMiddleware.js';
import { errorHandler as handleError } from '../MIDDLEWARE/ErrorHandler.js';

// Route to create a new document in a NoSQL collection
// Example: POST /api/nosql/collectionName
router.post('/:collectionName', validateNoSqlCreate, async (req, res) => {
    try {
        const { collectionName } = req.params;
        const documentData = req.body;
        const result = await createDocument(collectionName, documentData);
        res.status(201).json({ message: 'Document created successfully', data: result });
    } catch (error) {
        handleError(error, res);
    }
});

// Route to retrieve documents from a NoSQL collection
// Example: GET /api/nosql/collectionName?query={...}
router.get('/:collectionName', async (req, res) => {
    try {
        const { collectionName } = req.params;
        const query = req.query || {}; // Retrieve optional query from URL
        const results = await getDocuments(collectionName, query);
        res.status(200).json({ data: results });
    } catch (error) {
        handleError(error, res);
    }
});

// Route to update a document in a NoSQL collection
// Example: PUT /api/nosql/collectionName/documentId
router.put('/:collectionName/:documentId', validateNoSqlUpdate, async (req, res) => {
    try {
        const { collectionName, documentId } = req.params;
        const updateData = req.body;
        const result = await updateDocument(collectionName, documentId, updateData);
        res.status(200).json({ message: 'Document updated successfully', data: result });
    } catch (error) {
        handleError(error, res);
    }
});

// Route to delete a document from a NoSQL collection
// Example: DELETE /api/nosql/collectionName/documentId
router.delete('/:collectionName/:documentId', async (req, res) => {
    try {
        const { collectionName, documentId } = req.params;
        await deleteDocument(collectionName, documentId);
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        handleError(error, res);
    }
});

export default router;
