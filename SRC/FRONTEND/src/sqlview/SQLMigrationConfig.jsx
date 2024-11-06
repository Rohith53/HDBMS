// src/frontend/src/sqlView/SQLMigrationConfig.js

import React, { useState } from 'react';
import axios from '../api/api.jsx'; // Ensure this points to your configured Axios instance

const SQLMigrationConfig = () => {
  // State for managing user inputs and migration status
  const [tableName, setTableName] = useState('');
  const [primaryKey, setPrimaryKey] = useState('');
  const [targetDatabase, setTargetDatabase] = useState('MySQL');
  const [targetHost, setTargetHost] = useState('');
  const [targetPort, setTargetPort] = useState('3306');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [filters, setFilters] = useState(['']);
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  // Validate form inputs before starting migration
  const isFormValid = () => {
    return tableName && primaryKey && targetHost && username && password && filters.every(f => f.trim() !== '');
  };

  // Handle the form submission to initiate migration
  const handleMigration = async () => {
    if (!isFormValid()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (!window.confirm('Are you sure you want to start the migration? This action cannot be undone.')) {
      return;
    }

    setIsMigrating(true);
    setError('');
    setProgress('Starting migration...');

    try {
      const payload = {
        tableName,
        primaryKey,
        targetDatabase,
        targetHost,
        targetPort,
        username,
        password,
        filters: filters.filter(f => f.trim() !== '') // Only include non-empty filters
      };

      const response = await axios.post('/api/migrate/sql', payload);

      if (response.data.success) {
        setProgress('Migration in progress...');
        monitorMigrationProgress(response.data.migrationId);
      } else {
        throw new Error(response.data.message || 'Migration initiation failed.');
      }
    } catch (error) {
      setProgress('');
      setError(`Migration failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  // Polls backend for migration progress, and updates status
  const monitorMigrationProgress = (migrationId) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/migrate/status/${migrationId}`);
        if (response.data.status === 'completed') {
          setProgress('Migration completed successfully!');
          clearInterval(interval);
        } else if (response.data.status === 'failed') {
          setProgress('');
          setError('Migration failed during processing.');
          clearInterval(interval);
        } else {
          setProgress(`Migration progress: ${response.data.progress}%`);
        }
      } catch (error) {
        clearInterval(interval);
        setError('Error retrieving migration progress.');
      }
    }, 2000);
  };

  // Function to handle dynamic filter inputs
  const handleFilterChange = (index, value) => {
    const newFilters = [...filters];
    newFilters[index] = value;
    setFilters(newFilters);
  };

  // Function to add a new filter input
  const addFilter = () => {
    setFilters([...filters, '']);
  };

  // Function to remove a filter input
  const removeFilter = (index) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
  };

  return (
    <div className="sql-migration-config">
      <h2>SQL to MySQL Migration Configuration</h2>

      <form>
        <div className="form-group">
          <label>Table Name (required):</label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter SQL table name"
            required
          />
        </div>

        <div className="form-group">
          <label>Primary Key (required):</label>
          <input
            type="text"
            value={primaryKey}
            onChange={(e) => setPrimaryKey(e.target.value)}
            placeholder="Enter primary key"
            required
          />
        </div>

        <div className="form-group">
          <label>Target Database Host (required):</label>
          <input
            type="text"
            value={targetHost}
            onChange={(e) => setTargetHost(e.target.value)}
            placeholder="Enter MySQL host"
            required
          />
        </div>

        <div className="form-group">
          <label>Target Database Port:</label>
          <input
            type="number"
            value={targetPort}
            onChange={(e) => setTargetPort(e.target.value)}
            placeholder="Default is 3306"
            min="1"
            max="65535"
          />
        </div>

        <div className="form-group">
          <label>Username (required):</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter database username"
            required
          />
        </div>

        <div className="form-group">
          <label>Password (required):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter database password"
            required
          />
        </div>

        <div className="form-group">
          <label>Data Filters (optional):</label>
          {filters.map((filter, index) => (
            <div key={index} className="filter-group">
              <input
                type="text"
                value={filter}
                onChange={(e) => handleFilterChange(index, e.target.value)}
                placeholder={`Filter condition ${index + 1}`}
              />
              <button type="button" onClick={() => removeFilter(index)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addFilter}>Add Filter</button>
        </div>

        <div className="form-group">
          <label>Target Database:</label>
          <select value={targetDatabase} onChange={(e) => setTargetDatabase(e.target.value)}>
            <option value="MySQL">MySQL</option>
            {/* Add more options if there are other target databases */}
          </select>
        </div>

        <button
          type="button"
          onClick={handleMigration}
          disabled={isMigrating || !isFormValid()}
          className="btn-migrate"
        >
          {isMigrating ? 'Migrating...' : 'Start Migration'}
        </button>
      </form>

      {progress && <p className="progress-message">{progress}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default SQLMigrationConfig;
