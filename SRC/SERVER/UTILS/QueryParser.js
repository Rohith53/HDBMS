const { Parser } = require('node-sql-parser');
const { parse } = Parser; // Extracting parse function

/**
 * Parses an SQL query and converts it into a structured JSON object.
 * @param {string} query - The SQL query to be parsed.
 * @returns {Object} - A JSON object representing the parsed SQL query.
 * @throws {Error} - Throws an error if the query is invalid.
 */
export function parseSQLQuery(query) {
    // Input validation
    if (typeof query !== 'string' || query.trim() === '') {
        throw new Error('Invalid SQL query');
    }

    // Parse the query using the imported parse function
    try {
        const parsedQuery = parse(query);
        return transformParsedQuery(parsedQuery); // Transform the parsed structure into a JSON format
    } catch (error) {
        throw new Error('Error parsing SQL query: ' + error.message);
    }
}

/**
 * Parses individual SQL data rows into JSON format.
 * @param {string} row - SQL row to be parsed.
 * @returns {Object} - JSON representation of the SQL row.
 */
export function parseRow(row) {
    // Example parsing logic to split row by columns and map them as key-value pairs
    return row.split(',').reduce((acc, col) => {
        const [key, value] = col.split('=');
        acc[key.trim()] = value.trim();
        return acc;
    }, {});
}

/**
 * Parses multiple SQL rows into an array of JSON objects.
 * @param {Array} rows - SQL rows to be parsed.
 * @returns {Array} - Array of JSON representations of the SQL rows.
 */
export function parseSQLData(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('Invalid input: Expected an array of SQL rows');
    }

    // Use parseRow to process each row and return an array of parsed rows
    return rows.map(row => parseRow(row));
}

/**
 * Transforms the parsed SQL structure into a custom JSON format.
 * @param {Object} parsed - The parsed SQL object.
 * @returns {Object} - The transformed JSON object.
 */
function transformParsedQuery(parsed) {
    const transformed = {
        type: parsed.type,
        table: parsed.from ? parsed.from.map(table => table.id) : [],
        columns: parsed.select ? parsed.select.map(col => col.id) : [],
        where: parsed.where || null,
        orderBy: parsed.orderBy || null,
        limit: parsed.limit || null
    };
    return transformed;
}
