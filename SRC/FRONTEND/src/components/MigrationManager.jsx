// src/frontend/src/components/MigrationManager.js

import React, { useState } from 'react';
import { startSQLMigration, startNoSQLMigration, getMigrationStatus } from './api.jsx';
import './MigrationManager.css';


const MigrationManager = () => {
  const [migrationType, setMigrationType] = useState(''); // Tracks the selected migration type (SQL or NoSQL)
  const [config, setConfig] = useState({
    sql: { tableName: '', primaryKey: '', targetDatabase: 'MySQL', filters: '' },
    nosql: { collectionName: '', documentFields: '', targetDatabase: 'MongoDB', filters: '' },
  });
  const [progress, setProgress] = useState(''); // Tracks progress status
  const [isMigrating, setIsMigrating] = useState(false); // Disables button during migration
  const [error, setError] = useState(''); // Stores error messages

  // Handles the migration type selection (either SQL or NoSQL)
  const handleMigrationTypeChange = (type) => {
    setMigrationType(type);
    setProgress(''); // Reset progress and error when switching types
    setError('');
    setConfig({
      sql: { tableName: '', primaryKey: '', targetDatabase: 'MySQL', filters: '' },
      nosql: { collectionName: '', documentFields: '', targetDatabase: 'MongoDB', filters: '' },
    });
  };

  // Updates configuration settings as users type in fields
  const handleConfigChange = (e, key) => {
    const value = e.target.value;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [migrationType]: { ...prevConfig[migrationType], [key]: value },
    }));
  };

  // Validates that required fields for the selected migration type are populated
  const validateConfig = () => {
    if (migrationType === 'sql') {
      return config.sql.tableName && config.sql.primaryKey;
    } else if (migrationType === 'nosql') {
      return config.nosql.collectionName && config.nosql.documentFields;
    }
    return false;
  };

  // Starts the migration, with error handling and progress tracking
  const startMigration = async () => {
    if (!validateConfig()) {
        setError('Please complete all required fields for the migration.');
        return;
    }

    setIsMigrating(true);
    setError('');
    setProgress('Starting migration...');

    try {
        const payload = migrationType === 'sql' ? config.sql : config.nosql;
        
        // Choose the correct function based on migration type
        const response = migrationType === 'sql' 
            ? await startSQLMigration(payload) 
            : await startNoSQLMigration(payload);

        if (response.success) {
            setProgress('Migration in progress...');
            monitorMigrationProgress(response.migrationId);
        } else {
            throw new Error(response.message || 'Migration initiation failed.');
        }
    } catch (error) {
        setProgress('');
        setError(`Migration failed: ${error.response?.data?.message || error.message}`);
    } finally {
        setIsMigrating(false);
    }
};


  // Polls backend for migration progress, updates status, and manages errors
  const monitorMigrationProgress = (migrationId) => {
    const interval = setInterval(async () => {
        try {
            const response = await getMigrationStatus(migrationId);

            if (response.status === 'completed') {
                setProgress('Migration completed successfully!');
                clearInterval(interval);
            } else if (response.status === 'failed') {
                setProgress('');
                setError('Migration failed during processing.');
                clearInterval(interval);
            } else {
                setProgress(`Migration progress: ${response.progress}%`);
            }
        } catch (error) {
            clearInterval(interval);
            setError('Error retrieving migration progress.');
        }
    }, 2000);
};


  return (
    <div className="migration-manager">
      <h2>Migration Manager</h2>
      <div>
        <label>
          <input
            type="radio"
            value="sql"
            checked={migrationType === 'sql'}
            onChange={() => handleMigrationTypeChange('sql')}
          />
          SQL to MySQL
        </label>
        <label>
          <input
            type="radio"
            value="nosql"
            checked={migrationType === 'nosql'}
            onChange={() => handleMigrationTypeChange('nosql')}
          />
          NoSQL to MongoDB
        </label>
      </div>

      {migrationType === 'sql' && (
        <div className="sql-config">
          <h3>SQL Migration Configuration</h3>
          <label>
            Table Name:
            <input
              type="text"
              value={config.sql.tableName}
              onChange={(e) => handleConfigChange(e, 'tableName')}
              placeholder="Enter SQL Table Name"
            />
          </label>
          <label>
            Primary Key:
            <input
              type="text"
              value={config.sql.primaryKey}
              onChange={(e) => handleConfigChange(e, 'primaryKey')}
              placeholder="Enter Primary Key for Table"
            />
          </label>
          <label>
            Data Filters:
            <input
              type="text"
              value={config.sql.filters}
              onChange={(e) => handleConfigChange(e, 'filters')}
              placeholder="Enter any data filters (optional)"
            />
          </label>
        </div>
      )}

      {migrationType === 'nosql' && (
        <div className="nosql-config">
          <h3>NoSQL Migration Configuration</h3>
          <label>
            Collection Name:
            <input
              type="text"
              value={config.nosql.collectionName}
              onChange={(e) => handleConfigChange(e, 'collectionName')}
              placeholder="Enter NoSQL Collection Name"
            />
          </label>
          <label>
            Document Fields (comma-separated):
            <input
              type="text"
              value={config.nosql.documentFields}
              onChange={(e) => handleConfigChange(e, 'documentFields')}
              placeholder="Enter Document Fields"
            />
          </label>
          <label>
            Data Filters:
            <input
              type="text"
              value={config.nosql.filters}
              onChange={(e) => handleConfigChange(e, 'filters')}
              placeholder="Enter any data filters (optional)"
            />
          </label>
        </div>
      )}

      <button onClick={startMigration} disabled={isMigrating || !migrationType}>
        {isMigrating ? 'Migrating...' : 'Start Migration'}
      </button>

      {progress && <p className="migration-progress">{progress}</p>}
      {error && <p className="migration-error">{error}</p>}
    </div>
  );
};

export default MigrationManager;
