import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './QueryExecutor.css';
import { executeQuery } from '../components/api.jsx'; // Import executeQuery from the API module

// QueryExecutor Component
function QueryExecutor({ onResults }) {
    const [query, setQuery] = useState('');
    const [queryResults, setQueryResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handles the execution of the SQL query
    const handleExecuteQuery = async () => {
        if (!query.trim()) {
            setError('Please enter a valid SQL query.');
            return;
        }

        setLoading(true);
        setError('');
        setQueryResults([]);

        try {
            const results = await executeQuery(query);
            setQueryResults(results);
            onResults(results); // Optional callback to pass results to parent
        } catch (error) {
            setError('Error executing query. Please check your query syntax.');
            console.error('Error executing query:', error);
        } finally {
            setLoading(false);
        }
    };

    // Reset query and results
    const handleClear = () => {
        setQuery('');
        setQueryResults([]);
        setError('');
    };

    return (
        <div className="query-executor">
            <h2>SQL Query Executor</h2>
            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SQL query here"
            />
            <div className="query-actions">
                <button onClick={handleExecuteQuery} disabled={loading}>
                    {loading ? 'Executing...' : 'Run Query'}
                </button>
                <button onClick={handleClear}>Clear</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {queryResults.length > 0 && (
                <div className="query-results">
                    <h3>Query Results</h3>
                    <table>
                        <thead>
                            <tr>
                                {Object.keys(queryResults[0]).map((column) => (
                                    <th key={column}>{column}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {queryResults.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, idx) => (
                                        <td key={idx}>{value !== null ? value : 'NULL'}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// Prop types for type checking
QueryExecutor.propTypes = {
    onResults: PropTypes.func, // Callback to send query results to a parent component (optional)
};

export default QueryExecutor;