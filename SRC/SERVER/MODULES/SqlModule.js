// src/backend/modules/SQLModule.js

const fs = require('fs');
const path = require('path');
const fileStorage = require('../UTILS/FileStorage.js');
const queryParser = require('../UTILS/QueryParser.js');
const dataTranslator = require('../UTILS/DataTranslator.js');
const logger = require('../UTILS/Logger.js');

class SQLModule {
  constructor(config) {
    this.config = config;
    this.storagePath = config.storagePath || path.join(__dirname, '../../data/sql_data');
    fileStorage.createDirectoryIfNotExists(this.storagePath);  // Ensure storage path exists
  }

  /**
   * Executes a raw SQL query on the data files.
   * @param {string} query - The SQL query string to execute.
   * @returns {Promise<any>} - Returns the query result.
   */
  async executeQuery(query) {
    try {
      // Parse the SQL query
      const parsedQuery = queryParser.parseSQL(query);
      const result = await this._processParsedQuery(parsedQuery);
      logger.info(`Query executed successfully: ${query}`);
      return result;
    } catch (error) {
      logger.error(`Error executing query: ${error.message}`);
      throw new Error("SQL query execution failed");
    }
  }

  /**
   * Processes parsed SQL queries for CRUD operations.
   * @param {Object} parsedQuery - The parsed SQL query object.
   * @returns {Promise<any>} - Result of the processed query.
   * @private
   */
  async _processParsedQuery(parsedQuery) {
    const { operation, table, conditions, values } = parsedQuery;
    switch (operation) {
      case 'SELECT':
        return this.read(table, conditions);
      case 'INSERT':
        return this.create(table, values);
      case 'UPDATE':
        return this.update(table, conditions, values);
      case 'DELETE':
        return this.delete(table, conditions);
      default:
        throw new Error("Invalid SQL operation");
    }
  }

  /**
   * Create operation for SQL data.
   * @param {string} table - Table name to insert data.
   * @param {Object} values - Data to insert.
   * @returns {Promise<string>}
   */
  async create(table, values) {
    try {
      const filePath = path.join(this.storagePath, `${table}.json`);
      const data = await fileStorage.readData(filePath);
      data.push(values);
      await fileStorage.writeData(filePath, data);
      return 'Data inserted successfully';
    } catch (error) {
      logger.error(`Error creating data: ${error.message}`);
      throw new Error("SQL create operation failed");
    }
  }

  /**
   * Read operation for SQL data.
   * @param {string} table - Table name to read from.
   * @param {Object} [conditions] - Optional conditions for filtering.
   * @returns {Promise<Array>} - Array of matching records.
   */
  async read(table, conditions) {
    try {
      const filePath = path.join(this.storagePath, `${table}.json`);
      const data = await fileStorage.readData(filePath);
      const filteredData = dataTranslator.filterData(data, conditions);
      return filteredData;
    } catch (error) {
      logger.error(`Error reading data: ${error.message}`);
      throw new Error("SQL read operation failed");
    }
  }

  /**
   * Update operation for SQL data.
   * @param {string} table - Table name to update data in.
   * @param {Object} conditions - Conditions for identifying records to update.
   * @param {Object} values - Data to update.
   * @returns {Promise<string>}
   */
  async update(table, conditions, values) {
    try {
      const filePath = path.join(this.storagePath, `${table}.json`);
      const data = await fileStorage.readData(filePath);
      const updatedData = dataTranslator.updateData(data, conditions, values);
      await fileStorage.writeData(filePath, updatedData);
      return 'Data updated successfully';
    } catch (error) {
      logger.error(`Error updating data: ${error.message}`);
      throw new Error("SQL update operation failed");
    }
  }

  /**
   * Delete operation for SQL data.
   * @param {string} table - Table name to delete data from.
   * @param {Object} conditions - Conditions for identifying records to delete.
   * @returns {Promise<string>}
   */
  async delete(table, conditions) {
    try {
      const filePath = path.join(this.storagePath, `${table}.json`);
      const data = await fileStorage.readData(filePath);
      const filteredData = dataTranslator.deleteData(data, conditions);
      await fileStorage.writeData(filePath, filteredData);
      return 'Data deleted successfully';
    } catch (error) {
      logger.error(`Error deleting data: ${error.message}`);
      throw new Error("SQL delete operation failed");
    }
  }
}

module.exports = SQLModule;
