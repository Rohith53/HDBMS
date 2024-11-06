import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './DatabaseSelection.css'; // Optional CSS file for styling

// DatabaseSelection Component
function DatabaseSelection({ onSelect }) {
    const navigate = useNavigate();

    // Handle database type selection
    const handleSelection = (dbType) => {
        onSelect(dbType); // Update the selected database type in App.js
        if (dbType === 'SQL') {
            navigate('/sql');
        } else if (dbType === 'NoSQL') {
            navigate('/nosql');
        }
    };

    return (
        <div className="database-selection">
            <h2>Select Your Database Type</h2>
            <p>Please choose between SQL and NoSQL to proceed with your database setup.</p>
            
            {/* SQL Database Selection Button */}
            <button
                className="db-button sql-button"
                onClick={() => handleSelection('SQL')}
            >
                SQL Database
            </button>

            {/* NoSQL Database Selection Button */}
            <button
                className="db-button nosql-button"
                onClick={() => handleSelection('NoSQL')}
            >
                NoSQL Database
            </button>

            {/* Link to Cluster Manager */}
            <button
                className="db-button cluster-button"
                onClick={() => navigate('/cluster')}
            >
                Manage Clusters
            </button>
        </div>
    );
}

// Prop validation
DatabaseSelection.propTypes = {
    onSelect: PropTypes.func.isRequired,
};

export default DatabaseSelection;