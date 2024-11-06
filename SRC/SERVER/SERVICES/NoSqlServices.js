// src/backend/SERVICES/NoSqlServices.js

import dbConfig from '../CONFIG/DbConfig.js'; // Adjust according to your DB config setup

class NoSQLService {
    constructor(collection) {
        this.collection = collection;
    }

    async createDocument(document) {
        try {
            const result = await dbConfig.collection(this.collection).insertOne(document);
            console.log('Document created:', result.insertedId);
            return result;
        } catch (error) {
            console.error('Error creating document:', error);
            throw new Error('Failed to create document');
        }
    }

    async getDocuments(query = {}) {
        try {
            const documents = await dbConfig.collection(this.collection).find(query).toArray();
            console.log('Documents retrieved:', documents);
            return documents;
        } catch (error) {
            console.error('Error retrieving documents:', error);
            throw new Error('Failed to retrieve documents');
        }
    }

    async updateDocument(query, update) {
        try {
            const result = await dbConfig.collection(this.collection).updateOne(query, { $set: update });
            console.log('Document updated:', result.modifiedCount);
            return result;
        } catch (error) {
            console.error('Error updating document:', error);
            throw new Error('Failed to update document');
        }
    }

    async removeDocuments(query) {
        try {
            const result = await dbConfig.collection(this.collection).deleteMany(query);
            console.log('Documents removed:', result.deletedCount);
            return result;
        } catch (error) {
            console.error('Error removing documents:', error);
            throw new Error('Failed to remove documents');
        }
    }

    async bulkInsertDocuments(documents) {
        try {
            const result = await dbConfig.collection(this.collection).insertMany(documents);
            console.log('Documents inserted:', result.insertedIds);
            return result;
        } catch (error) {
            console.error('Error bulk inserting documents:', error);
            throw new Error('Failed to bulk insert documents');
        }
    }

    // New method to delete a single document
    async deleteDocument(query) {
        try {
            const result = await dbConfig.collection(this.collection).deleteOne(query);
            console.log('Document deleted:', result.deletedCount);
            return result;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw new Error('Failed to delete document');
        }
    }

    // New method to migrate data from one collection to another
    async migrateData(sourceCollection, targetCollection, query = {}) {
        try {
            // Get documents from the source collection
            const documents = await dbConfig.collection(sourceCollection).find(query).toArray();
            console.log(`Documents retrieved for migration from ${sourceCollection}:`, documents);

            // Insert the documents into the target collection
            if (documents.length > 0) {
                const result = await dbConfig.collection(targetCollection).insertMany(documents);
                console.log('Documents migrated to target collection:', result.insertedIds);
                return result;
            } else {
                console.log('No documents found for migration');
                return { acknowledged: true, insertedCount: 0 };
            }
        } catch (error) {
            console.error('Error migrating data:', error);
            throw new Error('Failed to migrate data');
        }
    }
}

// Exporting the NoSQLService class and its methods
export const createDocument = (collection, document) => {
    const service = new NoSQLService(collection);
    return service.createDocument(document);
};

export const getDocuments = (collection, query) => {
    const service = new NoSQLService(collection);
    return service.getDocuments(query);
};

export const updateDocument = (collection, query, update) => {
    const service = new NoSQLService(collection);
    return service.updateDocument(query, update);
};

export const removeDocuments = (collection, query) => {
    const service = new NoSQLService(collection);
    return service.removeDocuments(query);
};

export const bulkInsertDocuments = (collection, documents) => {
    const service = new NoSQLService(collection);
    return service.bulkInsertDocuments(documents);
};

// New export for deleting a single document
export const deleteDocument = (collection, query) => {
    const service = new NoSQLService(collection);
    return service.deleteDocument(query);
};

// New export for migrating data
export const migrateData = (sourceCollection, targetCollection, query) => {
    const service = new NoSQLService(sourceCollection); // You can use the service with either collection
    return service.migrateData(sourceCollection, targetCollection, query);
};

// Default export for the NoSQLService class (optional, if needed)
export default NoSQLService;
