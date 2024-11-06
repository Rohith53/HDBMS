import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Replace with your backend server's URL

// General Axios instance with base URL for consistent requests
const api = axios.create({
    baseURL: API_BASE_URL,
});

// SQL APIs

// Fetch available tables in SQL database
export const fetchTables = async () => {
    try {
        const response = await api.get('/sql/tables');
        return response.data;
    } catch (error) {
        console.error('Error fetching SQL tables:', error);
        throw error;
    }
};

// Fetch data from a specific SQL table
export const fetchTableData = async (tableName) => {
    try {
        const response = await api.get(`/sql/tables/${tableName}/data`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching data from SQL table ${tableName}:`, error);
        throw error;
    }
};

// Execute a custom SQL query
export const executeQuery = async (query) => {
    try {
        const response = await api.post('/sql/query', { query });
        return response.data;
    } catch (error) {
        console.error('Error executing SQL query:', error);
        throw error;
    }
};

// Create a new SQL table
export const createTable = async (tableName, schema) => {
    try {
        const response = await api.post('/sql/tables', { name: tableName, schema });
        return response.data;
    } catch (error) {
        console.error(`Error creating SQL table ${tableName}:`, error);
        throw error;
    }
};

// Delete an SQL table
export const deleteTable = async (tableName) => {
    try {
        const response = await api.delete(`/sql/tables/${tableName}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting SQL table ${tableName}:`, error);
        throw error;
    }
};

// Delete a row from an SQL table
export const deleteRow = async (tableName, rowId) => {
    try {
        const response = await api.delete(`/sql/tables/${tableName}/rows/${rowId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting row with ID ${rowId} from table ${tableName}:`, error);
        throw error;
    }
};

// Update a row in an SQL table
export const updateRow = async (tableName, rowId, updatedData) => {
    try {
        const response = await api.put(`/sql/tables/${tableName}/rows/${rowId}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating row with ID ${rowId} in table ${tableName}:`, error);
        throw error;
    }
};

// NoSQL APIs

// Fetch available collections in NoSQL database
export const fetchCollections = async () => {
    try {
        const response = await api.get('/nosql/collections');
        return response.data;
    } catch (error) {
        console.error('Error fetching NoSQL collections:', error);
        throw error;
    }
};

// Fetch documents from a specific NoSQL collection
export const fetchDocuments = async (collectionName) => {
    try {
        const response = await api.get(`/nosql/collections/${collectionName}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching documents for collection ${collectionName}:`, error);
        throw error;
    }
};

// Create a new NoSQL document
export const createDocument = async (collectionName, document) => {
    try {
        const response = await api.post(`/nosql/collections/${collectionName}`, document);
        return response.data;
    } catch (error) {
        console.error(`Error adding document to collection ${collectionName}:`, error);
        throw error;
    }
};

// Update an existing NoSQL document
export const updateDocument = async (collectionName, documentId, updatedDocument) => {
    try {
        const response = await api.put(`/nosql/collections/${collectionName}/${documentId}`, updatedDocument);
        return response.data;
    } catch (error) {
        console.error(`Error updating document ${documentId} in collection ${collectionName}:`, error);
        throw error;
    }
};

// Delete a NoSQL document
export const deleteDocument = async (collectionName, documentId) => {
    try {
        const response = await api.delete(`/nosql/collections/${collectionName}/${documentId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting document ${documentId} from collection ${collectionName}:`, error);
        throw error;
    }
};

// Execute a custom NoSQL query
export const executeNoSQLQuery = async (query) => {
    try {
        const response = await api.post('/nosql/query', { query });
        return response.data;
    } catch (error) {
        console.error('Error executing NoSQL query:', error);
        throw error;
    }
};

// Cluster Management APIs

// Fetch existing clusters
export const fetchClusters = async () => {
    try {
        const response = await api.get('/clusters');
        return response.data;
    } catch (error) {
        console.error('Error fetching clusters:', error);
        throw error;
    }
};

// Create a new cluster
export const createCluster = async (clusterName) => {
    try {
        const response = await api.post('/clusters', { name: clusterName });
        return response.data;
    } catch (error) {
        console.error(`Error creating cluster ${clusterName}:`, error);
        throw error;
    }
};

// Delete a cluster
export const deleteCluster = async (clusterId) => {
    try {
        const response = await api.delete(`/clusters/${clusterId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting cluster with ID ${clusterId}:`, error);
        throw error;
    }
};

export const startSQLMigration = async (payload) => {
    try {
        const response = await api.post('/api/migrate/sql', payload);
        return response.data;
    } catch (error) {
        console.error('Error starting SQL migration:', error);
        throw error;
    }
};

export const startNoSQLMigration = async (payload) => {
    try {
        const response = await api.post('/api/migrate/nosql', payload);
        return response.data;
    } catch (error) {
        console.error('Error starting NoSQL migration:', error);
        throw error;
    }
};

export const getMigrationStatus = async (migrationId) => {
    try {
        const response = await api.get(`/api/migrate/status/${migrationId}`);
        return response.data;
    } catch (error) {
        console.error('Error retrieving migration status:', error);
        throw error;
    }
};
