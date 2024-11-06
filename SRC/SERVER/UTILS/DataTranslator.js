const dataTranslator = {
    /**
     * Convert SQL rows to NoSQL format (JSON).
     * @param {Array} sqlData - Array of SQL rows to convert.
     * @returns {Array} - Array of NoSQL documents.
     */
    sqlToNoSql: (sqlData) => {
        return sqlData.map(row => {
            const convertedRow = {};
            for (const key in row) {
                convertedRow[key] = row[key];
            }
            return convertedRow;
        });
    },

    /**
     * Convert NoSQL documents to SQL format.
     * @param {Array} noSqlData - Array of NoSQL documents to convert.
     * @param {Object} tableSchema - SQL table schema defining expected fields.
     * @returns {Array} - Array of SQL rows.
     */
    noSqlToSql: (noSqlData, tableSchema) => {
        return noSqlData.map(doc => {
            const convertedRow = {};
            for (const key of Object.keys(tableSchema)) {
                convertedRow[key] = doc[key] !== undefined ? doc[key] : null; // Set to null if key does not exist
            }
            return convertedRow;
        });
    },

    /**
     * Convert value types if necessary.
     * @param {*} value - The value to convert.
     * @param {string} targetType - The target type for conversion.
     * @returns {*} - The converted value.
     */
    convertType: (value, targetType) => {
        switch (targetType) {
            case 'int':
                return parseInt(value, 10);
            case 'float':
                return parseFloat(value);
            case 'boolean':
                return value === 'true';
            case 'date':
                return new Date(value);
            default:
                return value;
        }
    },

    /**
     * Convert a specific field from one type to another.
     * @param {*} value - The value to convert.
     * @param {string} fromType - Original type of the value.
     * @param {string} toType - Target type for conversion.
     * @returns {*} - The converted field value.
     */
    convertField: (value, fromType, toType) => {
        if (fromType !== toType) {
            return dataTranslator.convertType(value, toType);
        }
        return value;
    },

    /**
     * Format data for MySQL insertion.
     * @param {Array} data - The data to format for MySQL.
     * @param {Object} tableSchema - Schema of the table for MySQL.
     * @returns {Array} - Formatted MySQL-compatible rows.
     */
    formatForMySQL: (data, tableSchema) => {
        return data.map(item => {
            const formattedItem = {};
            for (const [key, value] of Object.entries(item)) {
                // Ensure values match MySQL schema (e.g., dates as strings, integers, etc.)
                const expectedType = tableSchema[key];
                formattedItem[key] = dataTranslator.convertField(value, typeof value, expectedType);
            }
            return formattedItem;
        });
    },

    /**
     * Format data for MongoDB.
     * @param {Array} data - The data to format for MongoDB.
     * @returns {Array} - MongoDB-compatible documents.
     */
    formatForMongoDB: (data) => {
        return data.map(item => {
            const formattedItem = { ...item };

            // If necessary, ensure MongoDB-specific fields like ObjectId
            if (formattedItem._id && typeof formattedItem._id !== 'object') {
                formattedItem._id = new ObjectId(formattedItem._id); // If _id exists and is not an ObjectId, convert it.
            }

            // Optionally, handle nested objects or arrays based on your data structure
            return formattedItem;
        });
    }
};

// Export individual functions for specific imports
export const toNoSqlDocument = dataTranslator.sqlToNoSql;
export const toSqlRow = dataTranslator.noSqlToSql;
export const formatForMySQL = dataTranslator.formatForMySQL;
export const formatForMongoDB = dataTranslator.formatForMongoDB;
export default dataTranslator;
