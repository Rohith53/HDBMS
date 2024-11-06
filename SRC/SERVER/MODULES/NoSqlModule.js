// Import necessary modules and dependencies
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import ClusterModule  from './ClusterModule.js'; // Handles distributed storage logic
import { info } from '../UTILS/Logger.js'; // Logging utility for error and debug messages

// Define the NoSQLModule class
class NoSQLModule {
    constructor(dataDir) {
        this.dataDir = dataDir || join(__dirname, '../../data/nosql_data');
        this.clusterModule = new ClusterModule(this.dataDir); // Initialize ClusterModule
        this.init();
    }

    // Initialize directory for NoSQL data if it doesn't exist
    init() {
        if (!existsSync(this.dataDir)) {
            mkdirSync(this.dataDir, { recursive: true });
            info(`Created NoSQL data directory at: ${this.dataDir}`);
        }
    }

    // Helper function to get the path of a collection within the appropriate cluster
    getCollectionPath(collectionName) {
        const clusterPath = this.clusterModule.getClusterForCollection(collectionName);
        return join(clusterPath, `${collectionName}.json`);
    }

    // Create a new collection within a cluster
    create(collectionName) {
        const collectionPath = this.getCollectionPath(collectionName);
        if (existsSync(collectionPath)) {
            throw new Error(`Collection ${collectionName} already exists.`);
        }
        writeFileSync(collectionPath, JSON.stringify([])); // Initialize empty collection
        info(`Collection ${collectionName} created in cluster.`);
        return { message: `Collection ${collectionName} created.` };
    }

    // Insert a single document into a specified collection within a cluster
    insert(collectionName, document) {
        const collectionPath = this.getCollectionPath(collectionName);
        if (!existsSync(collectionPath)) {
            throw new Error(`Collection ${collectionName} does not exist.`);
        }
        const collection = JSON.parse(readFileSync(collectionPath));
        document._id = uuidv4(); // Assign unique ID to the document
        collection.push(document);
        writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
        info(`Document added to ${collectionName} with ID ${document._id} in cluster.`);
        return document;
    }

    // Insert multiple documents into a specified collection
    bulkInsert(collectionName, documents) {
        const collectionPath = this.getCollectionPath(collectionName);
        if (!existsSync(collectionPath)) {
            throw new Error(`Collection ${collectionName} does not exist.`);
        }
        const collection = JSON.parse(readFileSync(collectionPath));
        const insertedDocuments = documents.map(doc => ({ ...doc, _id: uuidv4() }));
        collection.push(...insertedDocuments);
        writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
        info(`Bulk inserted ${documents.length} documents into ${collectionName} in cluster.`);
        return insertedDocuments;
    }

    // Retrieve documents from a collection based on filter criteria
    find(collectionName, filter = {}) {
        const collectionPath = this.getCollectionPath(collectionName);
        if (!existsSync(collectionPath)) {
            throw new Error(`Collection ${collectionName} does not exist.`);
        }
        const collection = JSON.parse(readFileSync(collectionPath));
        const filteredDocuments = collection.filter((doc) =>
            Object.keys(filter).every(key => doc[key] === filter[key])
        );
        return filteredDocuments;
    }

    // Update documents in a collection based on filter criteria
    update(collectionName, filter = {}, updateData) {
        const collectionPath = this.getCollectionPath(collectionName);
        if (!existsSync(collectionPath)) {
            throw new Error(`Collection ${collectionName} does not exist.`);
        }
        let collection = JSON.parse(readFileSync(collectionPath));
        let updatedCount = 0;

        collection = collection.map((doc) => {
            const match = Object.keys(filter).every(key => doc[key] === filter[key]);
            if (match) {
                updatedCount++;
                return { ...doc, ...updateData };
            }
            return doc;
        });

        writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
        info(`Updated ${updatedCount} documents in ${collectionName} in cluster.`);
        return { message: `Updated ${updatedCount} documents`, count: updatedCount };
    }

    // Delete documents from a collection based on filter criteria
    remove(collectionName, filter = {}) {
        const collectionPath = this.getCollectionPath(collectionName);
        if (!existsSync(collectionPath)) {
            throw new Error(`Collection ${collectionName} does not exist.`);
        }
        const collection = JSON.parse(readFileSync(collectionPath));
        const filteredCollection = collection.filter((doc) =>
            !Object.keys(filter).every(key => doc[key] === filter[key])
        );

        const deletedCount = collection.length - filteredCollection.length;
        writeFileSync(collectionPath, JSON.stringify(filteredCollection, null, 2));
        info(`Deleted ${deletedCount} documents from ${collectionName} in cluster.`);
        return { message: `Deleted ${deletedCount} documents`, count: deletedCount };
    }

    // Drop an entire collection within the cluster
    dropCollection(collectionName) {
        const collectionPath = this.getCollectionPath(collectionName);
        if (!existsSync(collectionPath)) {
            throw new Error(`Collection ${collectionName} does not exist.`);
        }
        unlinkSync(collectionPath);
        info(`Collection ${collectionName} dropped from cluster.`);
        return { message: `Collection ${collectionName} dropped.` };
    }
}

// Exporting functions for use in services
export const create = (collectionName) => new NoSQLModule().create(collectionName);
export const insert = (collectionName, document) => new NoSQLModule().insert(collectionName, document);
export const bulkInsert = (collectionName, documents) => new NoSQLModule().bulkInsert(collectionName, documents);
export const find = (collectionName, filter) => new NoSQLModule().find(collectionName, filter);
export const update = (collectionName, filter, updateData) => new NoSQLModule().update(collectionName, filter, updateData);
export const remove = (collectionName, filter) => new NoSQLModule().remove(collectionName, filter);
export const dropCollection = (collectionName) => new NoSQLModule().dropCollection(collectionName);

// Export NoSQLModule for use in other parts of the application
export default NoSQLModule;
