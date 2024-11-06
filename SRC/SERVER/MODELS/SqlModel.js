import mysql from 'mysql'; // Import MySQL library

// Create a connection pool for the database
const pool = mysql.createPool({
    connectionLimit: 10, // Maximum number of connections to create at once
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hdbms', // Default database name
});

// Function to execute a query
const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (error, results) => {
            if (error) {
                return reject(error); // Reject the promise if an error occurs
            }
            resolve(results); // Resolve the promise with results if successful
        });
    });
};

// Insert a new record into a specified table
export const insert = async (tableName, data) => {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    return await executeQuery(query, Object.values(data)); // Call executeQuery with insert query
};

// Create a new table in the database
export const createNewTable = async (tableName, schema) => {
    const columns = Object.entries(schema)
        .map(([column, type]) => `${column} ${type}`)
        .join(', ');

    const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
    return await executeQuery(query); // Call executeQuery to create the table
};

// Find records in a specified table based on conditions
export const find = async (tableName, conditions = {}) => {
    let query = `SELECT * FROM ${tableName}`;
    const params = [];

    // Build conditions if any
    if (Object.keys(conditions).length) {
        const conditionString = Object.keys(conditions)
            .map(key => `${key} = ?`)
            .join(' AND ');
        query += ` WHERE ${conditionString}`;
        params.push(...Object.values(conditions)); // Add condition values to params
    }

    return await executeQuery(query, params); // Call executeQuery with find query
};

// Update a record in a specified table
export const update = async (tableName, data, conditions) => {
    const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const conditionString = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');

    const query = `UPDATE ${tableName} SET ${updates} WHERE ${conditionString}`;
    const params = [...Object.values(data), ...Object.values(conditions)];
    return await executeQuery(query, params); // Call executeQuery with update query
};

// Delete a record from a specified table
export const deleteRecord = async (tableName, conditions) => {
    const conditionString = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');

    const query = `DELETE FROM ${tableName} WHERE ${conditionString}`;
    return await executeQuery(query, Object.values(conditions)); // Call executeQuery with delete query
};

// Get all table names in the database
export const getAllTables = async () => {
    const query = "SHOW TABLES"; // Query to retrieve all table names
    const results = await executeQuery(query); // Call executeQuery with the query
    return results.map(row => Object.values(row)[0]); // Return table names
};

// Get all records from a specified table
export const getTableRecords = async (tableName) => {
    const query = `SELECT * FROM ${tableName}`; // Query to select all records
    return await executeQuery(query); // Call executeQuery with the query
};

// Function to close the database connection pool (optional, depending on usage)
export const closeConnection = () => {
    pool.end(err => {
        if (err) {
            console.error('Error closing the database connection:', err);
        } else {
            console.log('Database connection closed.');
        }
    });
};

export default {
    insert,
    find,
    update,
    deleteRecord,
    closeConnection,
    createNewTable, // Include createTable here
    getAllTables, // Export the getAllTables function
    getTableRecords, // Export the getTableRecords function
};
