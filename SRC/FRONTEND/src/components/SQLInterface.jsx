import React, { useEffect, useState } from 'react';
import './SQLInterface.css'; // Optional CSS file for styling
import { fetchTables, executeQuery, createTable, deleteTable } from './api.jsx'; // Adjust import as per your API structure
import TableView from '../sqlview/TableView.jsx'; // Import TableView for displaying query results

// SQLInterface Component
function SQLInterface() {
    const [tables, setTables] = useState([]);
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState(null);
    const [newTableName, setNewTableName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch tables on component mount
    useEffect(() => {
        loadTables();
    }, []);

    // Load tables from the database
    const loadTables = async () => {
        setLoading(true);
        try {
            const fetchedTables = await fetchTables();
            setTables(fetchedTables);
        } catch (error) {
            setError('Error fetching tables. Please try again.');
            console.error('Error fetching tables:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle SQL query execution
    const handleExecuteQuery = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await executeQuery(query);
            setResponse(result);
            setQuery(''); // Reset query input after execution
        } catch (error) {
            setError('Error executing query. Please check your SQL syntax.');
            console.error('Error executing query:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle table creation
    const handleCreateTable = async () => {
        setError('');
        if (!newTableName) {
            setError('Table name cannot be empty.');
            return;
        }
        try {
            await createTable(newTableName);
            setNewTableName(''); // Reset input
            loadTables(); // Refresh tables
        } catch (error) {
            setError('Error creating table. Please try again.');
            console.error('Error creating table:', error);
        }
    };

    // Handle table deletion
    const handleDeleteTable = async (tableName) => {
        if (window.confirm(`Are you sure you want to delete the table ${tableName}?`)) {
            setLoading(true);
            try {
                await deleteTable(tableName);
                loadTables(); // Refresh tables
            } catch (error) {
                setError('Error deleting table. Please try again.');
                console.error('Error deleting table:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="sql-interface">
            <h2>SQL Interface</h2>
            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}

            <div className="table-management">
                <h3>Manage Tables</h3>
                <ul className="table-list">
                    {tables.map((table) => (
                        <li key={table}>
                            {table}
                            <button className="delete-button" onClick={() => handleDeleteTable(table)}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="create-table">
                    <input
                        type="text"
                        value={newTableName}
                        onChange={(e) => setNewTableName(e.target.value)}
                        placeholder="New Table Name"
                    />
                    <button onClick={handleCreateTable}>Create Table</button>
                </div>
            </div>

            <div className="query-execution">
                <h3>Execute SQL Query</h3>
                <textarea
                    rows="5"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter SQL query here..."
                />
                <button onClick={handleExecuteQuery}>Run Query</button>

                <h4>Response</h4>
                {response ? (
                    <TableView data={response} /> // Display query results in a table format
                ) : (
                    <pre className="response">No response yet.</pre>
                )}
            </div>
        </div>
    );
}

export default SQLInterface;