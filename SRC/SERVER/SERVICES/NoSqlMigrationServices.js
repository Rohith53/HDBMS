// src/backend/services/noSqlMigrationService.js

import { MongoClient } from 'mongodb';
import { info, error as logError } from '../UTILS/Logger.js';
import { validateNoSQLDocument } from '../MIDDLEWARE/ValidationMiddleware.js';
import { migrateNoSQLToMongoDB as migrationHelper } from '../UTILS/MigrationHelper.js';
import dbConfig from '../CONFIG/DbConfig.js';

/**
 * Initialize MongoDB connection
 * @returns {Promise<MongoClient>} - A promise that resolves to the MongoDB client.
 */
export async function connectToMongo() {
  try {
    const client = new MongoClient(dbConfig.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    info('Connected to MongoDB');
    return client;
  } catch (error) {
    logError('Error connecting to MongoDB:', error.message);
    throw new Error('Failed to connect to MongoDB');
  }
}

/**
 * Migrate documents from a NoSQL collection in HDBMS to MongoDB.
 * @param {string} collectionName - The HDBMS collection name to migrate.
 * @param {object[]} documents - Array of documents to be migrated.
 * @returns {object} - Migration status with counts of successful and failed documents.
 */
export async function migrateToMongoDB(collectionName, documents) {
  let client;
  try {
    // Validate each document to ensure compatibility with MongoDB
    documents.forEach(doc => validateNoSQLDocument(doc));

    // Connect to MongoDB and access the specified collection
    client = await connectToMongo();
    const db = client.db(dbConfig.mongoDbName);
    const mongoCollection = db.collection(collectionName);

    // Transform documents if necessary using migrationHelper
    const transformedDocs = documents.map(doc => migrationHelper.transformToMongoCompatible(doc));

    // Perform bulk insert operation
    const result = await mongoCollection.insertMany(transformedDocs);
    info(`Migrated ${result.insertedCount} documents from ${collectionName} to MongoDB successfully`);

    return {
      status: 'Success',
      migratedCount: result.insertedCount,
      failedCount: documents.length - result.insertedCount
    };
  } catch (error) {
    logError(`Error migrating collection ${collectionName} to MongoDB: ${error.message}`);
    throw new Error('Migration failed');
  } finally {
    // Ensure MongoDB client is closed after migration
    if (client) {
      await client.close();
      info('MongoDB connection closed');
    }
  }
}

/**
 * Rollback migration if any document fails to insert.
 * @param {string} collectionName - The MongoDB collection name.
 * @returns {boolean} - True if rollback is successful.
 */
export async function rollbackMigration(collectionName) {
  let client;
  try {
    // Connect to MongoDB
    client = await connectToMongo();
    const db = client.db(dbConfig.mongoDbName);
    const mongoCollection = db.collection(collectionName);

    // Delete all documents in the collection to rollback
    const deleteResult = await mongoCollection.deleteMany({});
    info(`Rollback successful for ${collectionName}, removed ${deleteResult.deletedCount} documents`);
    return true;
  } catch (error) {
    logError(`Error during rollback for collection ${collectionName}: ${error.message}`);
    return false;
  } finally {
    if (client) {
      await client.close();
      info('MongoDB connection closed after rollback');
    }
  }
}

/**
 * Migrate data from a source collection to a target database and collection.
 * @param {string} sourceCollection - The source collection to migrate data from.
 * @param {string} targetDB - The target MongoDB database name.
 * @param {string} targetCollection - The target MongoDB collection name.
 * @returns {object} - Migration status with counts of successful and failed documents.
 */
export async function migrateData(sourceCollection, targetDB, targetCollection) {
  let client;
  try {
    // Connect to MongoDB and access the source and target collections
    client = await connectToMongo();

    const sourceDb = client.db(dbConfig.mongoDbName);
    const targetDb = client.db(targetDB);

    const sourceColl = sourceDb.collection(sourceCollection);
    const targetColl = targetDb.collection(targetCollection);

    // Retrieve documents from the source collection
    const documents = await sourceColl.find({}).toArray();

    // Validate and transform documents if necessary
    documents.forEach(doc => validateNoSQLDocument(doc));
    const transformedDocs = documents.map(doc => migrationHelper.transformToMongoCompatible(doc));

    // Perform bulk insert operation on the target collection
    const result = await targetColl.insertMany(transformedDocs);

    info(`Migrated ${result.insertedCount} documents from ${sourceCollection} to ${targetCollection} in ${targetDB} successfully`);

    return {
      status: 'Success',
      migratedCount: result.insertedCount,
      failedCount: documents.length - result.insertedCount
    };
  } catch (error) {
    logError(`Error migrating data from ${sourceCollection} to ${targetCollection}: ${error.message}`);
    throw new Error('Migration failed');
  } finally {
    // Ensure MongoDB client is closed after migration
    if (client) {
      await client.close();
      info('MongoDB connection closed after migration');
    }
  }
}
