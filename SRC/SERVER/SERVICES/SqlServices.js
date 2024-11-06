// sqlService.js
import { createTable as _createTable, insertData as _insertData, getAllRecords as _getAllRecords, getRecordById as _getRecordById, updateRecord as _updateRecord, deleteRecord as _deleteRecord, executeQuery as _executeQuery } from '../MODULES/SqlModule.js';
import { validateSQLData } from '../MIDDLEWARE/ValidationMiddleware.js';
import { info, error as _error } from '../UTILS/Logger.js';
import { parse } from '../UTILS/QueryParser.js';

class SQLService {
  /**
   * Creates a new SQL table with the specified schema.
   * @param {string} tableName - Name of the table to create.
   * @param {Object} schema - Object defining the table schema.
   * @returns {Object} - Confirmation message or error.
   */
  static async createTable(tableName, schema) {
    try {
      // Validate schema before creating table
      await validateSQLData(schema, true); // true for schema validation
      const result = await _createTable(tableName, schema);
      info(`Table ${tableName} created successfully.`);
      return result;
    } catch (error) {
      _error(`Error creating table ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Inserts data into a specified SQL table.
   * @param {string} tableName - Name of the table.
   * @param {Object} data - Data to insert.
   * @returns {Object} - Confirmation message or error.
   */
  static async insertData(tableName, data) {
    try {
      // Validate data against table schema
      await validateSQLData(data);
      const result = await _insertData(tableName, data);
      info(`Data inserted into table ${tableName}.`);
      return result;
    } catch (error) {
      _error(`Error inserting data into ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves all records from a specified table.
   * @param {string} tableName - Name of the table.
   * @returns {Array} - Array of records.
   */
  static async getAllRecords(tableName) {
    try {
      const records = await _getAllRecords(tableName);
      info(`Records retrieved from table ${tableName}.`);
      return records;
    } catch (error) {
      _error(`Error retrieving records from ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves a single record by ID.
   * @param {string} tableName - Name of the table.
   * @param {string|number} id - Primary key of the record.
   * @returns {Object|null} - Record data or null if not found.
   */
  static async getRecordById(tableName, id) {
    try {
      const record = await _getRecordById(tableName, id);
      if (!record) {
        throw new Error(`Record with ID ${id} not found in table ${tableName}.`);
      }
      info(`Record ${id} retrieved from table ${tableName}.`);
      return record;
    } catch (error) {
      _error(`Error retrieving record ${id} from ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Updates a record in a specified table by ID.
   * @param {string} tableName - Name of the table.
   * @param {string|number} id - Primary key of the record.
   * @param {Object} data - Data to update.
   * @returns {Object} - Confirmation message or error.
   */
  static async updateRecord(tableName, id, data) {
    try {
      await validateSQLData(data); // Validate data structure
      const result = await _updateRecord(tableName, id, data);
      info(`Record ${id} updated in table ${tableName}.`);
      return result;
    } catch (error) {
      _error(`Error updating record ${id} in ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deletes a record by ID from a specified table.
   * @param {string} tableName - Name of the table.
   * @param {string|number} id - Primary key of the record.
   * @returns {Object} - Confirmation message or error.
   */
  static async deleteRecord(tableName, id) {
    try {
      const result = await _deleteRecord(tableName, id);
      info(`Record ${id} deleted from table ${tableName}.`);
      return result;
    } catch (error) {
      _error(`Error deleting record ${id} from ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Executes a complex SQL-like query.
   * @param {string} query - SQL query string.
   * @returns {Array|Object} - Query result.
   */
  static async executeQuery(query) {
    try {
      const parsedQuery = parse(query);
      const result = await _executeQuery(parsedQuery);
      info(`Query executed successfully: ${query}`);
      return result;
    } catch (error) {
      _error(`Error executing query: ${error.message}`);
      throw error;
    }
  }
}

export default SQLService;
