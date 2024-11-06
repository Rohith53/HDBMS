// Import necessary modules and dependencies
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { MongoClient } from 'mongodb';
import { info, error as _error } from '../UTILS/Logger.js'; // Logging utility for error and debug messages
import { getClusterPathForCollection, listCollectionsInCluster } from './ClusterModule.js'; // Manages distributed storage and clusters

// Define the NoSQLMigrationModule class
class NoSQLMigrationModule {
    constructor(mongoUri, clusterConfig) {
        this.mongoUri = mongoUri;
        this.clusterConfig = clusterConfig; // Configuration for managing clusters
        this.client = null; // MongoDB client instance
    }

    // Initialize MongoDB connection
    async connectToMongoDB() {
        try {
            this.client = new MongoClient(this.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            await this.client.connect();
            info("Connected to MongoDB successfully.");
        } catch (error) {
            _error("Failed to connect to MongoDB:", error);
            throw new Error("MongoDB connection failed.");
        }
    }

    // Disconnect from MongoDB
    async disconnectFromMongoDB() {
        if (this.client) {
            await this.client.close();
            info("Disconnected from MongoDB.");
        }
    }

    // Helper function to retrieve a collection's data path within the cluster system
    getCollectionPath(collectionName) {
        const clusterPath = getClusterPathForCollection(collectionName, this.clusterConfig);
        if (!clusterPath) {
            throw new Error(`Cluster path for collection ${collectionName} not found.`);
        }
        return join(clusterPath, `${collectionName}.json`);
    }

    // Read and parse data from a local NoSQL collection within the cluster system
    readLocalCollectionData(collectionName) {
        const collectionPath = this.getCollectionPath(collectionName);
        if (!existsSync(collectionPath)) {
            throw new Error(`Collection ${collectionName} does not exist in the cluster.`);
        }
        const collectionData = JSON.parse(readFileSync(collectionPath));
        info(`Loaded data from local collection in cluster: ${collectionName}`);
        return collectionData;
    }

    // Migrate a collection from local NoSQL data in the cluster system to MongoDB
    async migrateCollectionToMongoDB(localCollectionName, mongoCollectionName) {
        try {
            // Connect to MongoDB
            await this.connectToMongoDB();
            const db = this.client.db(); // Use the default database in MongoDB

            // Retrieve data from the local NoSQL collection in the cluster
            const localData = this.readLocalCollectionData(localCollectionName);

            // Access the target MongoDB collection
            const mongoCollection = db.collection(mongoCollectionName);

            // Perform the migration
            if (localData.length > 0) {
                const result = await mongoCollection.insertMany(localData);
                info(`Successfully migrated ${result.insertedCount} documents to MongoDB collection ${mongoCollectionName}.`);
                return { message: `Migrated ${result.insertedCount} documents.`, success: true };
            } else {
                info(`No data to migrate for collection: ${localCollectionName}`);
                return { message: `No data to migrate for collection: ${localCollectionName}`, success: true };
            }
        } catch (error) {
            _error(`Migration failed for collection ${localCollectionName}:`, error);
            throw new Error(`Migration failed for collection ${localCollectionName}.`);
        } finally {
            // Ensure MongoDB disconnection
            await this.disconnectFromMongoDB();
        }
    }

    // Migrate all local NoSQL collections within the cluster system to MongoDB
    async migrateAllCollections() {
        const collections = listCollectionsInCluster(this.clusterConfig);
        let migrationSummary = {};

        for (const collectionName of collections) {
            try {
                const migrationResult = await this.migrateCollectionToMongoDB(collectionName, collectionName);
                migrationSummary[collectionName] = migrationResult.message;
            } catch (error) {
                migrationSummary[collectionName] = `Migration failed: ${error.message}`;
            }
        }

        return migrationSummary;
    }
}

// Export NoSQLMigrationModule for use in other parts of the application
export default NoSQLMigrationModule;
