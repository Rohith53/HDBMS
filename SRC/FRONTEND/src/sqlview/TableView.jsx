import React, { useEffect, useState } from 'react';
import './TableView.css'; // Optional CSS for styling
import { fetchTables, fetchTableData, createTable, updateRow, deleteRow, executeQuery } from '../components/api.jsx'; // Adjust imports according to your API structure

// TableView Component
function TableView({ selectedTable }) {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newRow, setNewRow] = useState({});
    const [query, setQuery] = useState('');
    const [queryResults, setQueryResults] = useState([]);

    // Load table data when the selected table changes
    useEffect(() => {
        if (selectedTable) {
            loadTableData();
        }
    }, [selectedTable]);

    // Load data for the selected table
    const loadTableData = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchTableData(selectedTable);
            setTableData(data);
        } catch (error) {
            setError('Error fetching table data. Please try again.');
            console.error('Error fetching table data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle new row creation
    const handleCreateRow = async () => {
        if (!Object.keys(newRow).length) {
            setError('Please fill out the row data before adding.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await createTable(selectedTable, newRow);
            loadTableData(); // Refresh table data
            setNewRow({}); // Reset input
        } catch (error) {
            setError('Error adding new row. Please try again.');
            console.error('Error adding new row:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle row update
    const handleUpdateRow = async (rowId, updatedRow) => {
        setLoading(true);
        setError('');
        try {
            await updateRow(selectedTable, rowId, updatedRow);
            loadTableData(); // Refresh table data
        } catch (error) {
            setError('Error updating row. Please try again.');
            console.error('Error updating row:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle row deletion
    const handleDeleteRow = async (rowId) => {
        if (window.confirm('Are you sure you want to delete this row?')) {
            setLoading(true);
            setError('');
            try {
                await deleteRow(selectedTable, rowId);
                loadTableData(); // Refresh table data
            } catch (error) {
                setError('Error deleting row. Please try again.');
                console.error('Error deleting row:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Execute a SQL query
    const handleExecuteQuery = async () => {
        setLoading(true);
        setError('');
        setQueryResults([]);
        try {
            const results = await executeQuery(query);
            setQueryResults(results);
        } catch (error) {
            setError('Error executing query. Please try again.');
            console.error('Error executing query:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="table-view">
            <h2>Table: {selectedTable}</h2>
            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}
            
            <div className="create-row">
                <h3>Add New Row</h3>
                {/* Form for adding a new row */}
                <input
                    type="text"
                    placeholder="Column1"
                    onChange={(e) => setNewRow({ ...newRow, column1: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Column2"
                    onChange={(e) => setNewRow({ ...newRow, column2: e.target.value })}
                />
                <button onClick={handleCreateRow}>Add Row</button>
            </div>

            <div className="query-execution">
                <h3>Execute SQL Query</h3>
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your SQL query here"
                />
                <button onClick={handleExecuteQuery}>Run Query</button>
                {queryResults.length > 0 && (
                    <div className="query-results">
                        <h4>Query Results</h4>
                        <ul>
                            {queryResults.map((result, index) => (
                                <li key={index}>{JSON.stringify(result)}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="table-data">
                <h3>Table Data</h3>
                {tableData.length === 0 ? (
                    <p>No data available.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                {/* Adjust headers based on your table structure */}
                                <th>Column1</th>
                                <th>Column2</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row) => (
                                <tr key={row.id}>
                                    <td>{row.column1}</td>
                                    <td>{row.column2}</td>
                                    <td>
                                        <button onClick={() => handleUpdateRow(row.id, row)}>Edit</button>
                                        <button onClick={() => handleDeleteRow(row.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default TableView;
