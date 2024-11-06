// src/backend/modules/DataConversionModule.js

// Dependencies
import { info, error as _error } from '../UTILS/Logger.js';
import { parseRow } from '../UTILS/QueryParser.js'; // For parsing SQL queries to JSON
import { toNoSqlDocument, toSqlRow } from '../UTILS/DataTranslator.js'; // For handling data type conversions

class DataConversionModule {
  /**
   * Converts SQL data (rows and columns) to a NoSQL document structure (JSON format).
   * Utilizes queryParser for parsing and dataTranslator for type conversion.
   * @param {Array} sqlData - Array of SQL row objects representing the data to be converted.
   * @returns {Array} Converted NoSQL document array.
   */
  static sqlToNoSql(sqlData) {
    try {
      // Parse SQL data using queryParser to prepare it for NoSQL format
      const parsedData = sqlData.map(row => parseRow(row));
      const nosqlData = parsedData.map(row => toNoSqlDocument(row));

      info("SQL to NoSQL conversion successful");
      return nosqlData;
    } catch (error) {
      _error("Error in SQL to NoSQL conversion:", error);
      throw new Error("SQL to NoSQL conversion failed");
    }
  }

  /**
   * Converts NoSQL document array (JSON format) to SQL row structure (Array of objects).
   * Utilizes dataTranslator for type conversion back to SQL-compatible structure.
   * @param {Array} nosqlData - Array of NoSQL documents representing the data to be converted.
   * @returns {Array} Converted SQL rows with consistent columns.
   */
  static noSQLToSQL(nosqlData) {
    try {
      const sqlRows = nosqlData.map(document => toSqlRow(document));

      info("NoSQL to SQL conversion successful");
      return sqlRows;
    } catch (error) {
      _error("Error in NoSQL to SQL conversion:", error);
      throw new Error("NoSQL to SQL conversion failed");
    }
  }

  /**
   * Converts NoSQL data (documents) to SQL rows using a provided schema.
   * This method maps NoSQL documents to the specified SQL schema and ensures that all columns are aligned with the schema.
   * @param {Object} sqlSchema - The SQL schema to match the NoSQL data against.
   * @param {Array} nosqlData - Array of NoSQL documents.
   * @returns {Array} SQL-ready data, mapped to the provided schema.
   */
  static noSqlToSqlWithSchema(sqlSchema, nosqlData) {
    try {
      const sqlRows = nosqlData.map(doc => {
        const row = {};
        for (const column in sqlSchema) {
          row[column] = doc[column] !== undefined ? doc[column] : null;
        }
        return row;
      });

      info("NoSQL to SQL with schema conversion successful");
      return sqlRows;
    } catch (error) {
      _error("Error in NoSQL to SQL with schema conversion:", error);
      throw new Error("NoSQL to SQL with schema conversion failed");
    }
  }

  /**
   * Utility function to normalize SQL rows for consistency during conversion.
   * Ensures all rows have the same columns.
   * @param {Array} sqlRows - SQL row array to be normalized.
   * @returns {Array} Normalized SQL row array.
   */
  static normalizeSqlRows(sqlRows) {
    const allKeys = new Set();
    sqlRows.forEach(row => Object.keys(row).forEach(key => allKeys.add(key)));
    return sqlRows.map(row => {
      const normalizedRow = {};
      allKeys.forEach(key => {
        normalizedRow[key] = row[key] !== undefined ? row[key] : null;
      });
      return normalizedRow;
    });
  }

  /**
   * Utility function to handle schema conflicts during NoSQL to SQL conversion.
   * Adjusts NoSQL documents to match the specified SQL schema structure.
   * @param {Object} sqlSchema - Target SQL schema structure for reference.
   * @param {Array} nosqlData - NoSQL data to be mapped.
   * @returns {Array} SQL-ready data with adjusted schema.
   */
  static resolveSchemaConflicts(sqlSchema, nosqlData) {
    return nosqlData.map(doc => {
      const resolvedRow = {};
      for (const column in sqlSchema) {
        resolvedRow[column] = doc[column] !== undefined ? doc[column] : null;
      }
      return resolvedRow;
    });
  }
}

// src/backend/modules/DataConversionModule.js

// src/backend/modules/DataConversionModule.js

export const sqlToNoSql = DataConversionModule.sqlToNoSql;
export const noSQLToSQL = DataConversionModule.noSQLToSQL;
export const noSqlToSqlWithSchema = DataConversionModule.noSqlToSqlWithSchema;
export const normalizeSqlRows = DataConversionModule.normalizeSqlRows;
export const resolveSchemaConflicts = DataConversionModule.resolveSchemaConflicts;



