import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DatabaseSelection from './components/DatabaseSelection';
import SQLInterface from './components/SQLInterface';
import NoSQLInterface from './components/NoSQLInterface';
import ClusterManager from './components/ClusterManager';
import MigrationManager from './components/MigrationManager.jsx'

function App() {
    const [dbType, setDbType] = useState(null); // Stores user's selected database type

    const handleDbSelection = (type) => {
        setDbType(type);
    };

    return (
        <Router>
            <div>
                <h1>Hybrid Database Management System (HDBMS)</h1>
                <Routes>
                    <Route 
                        path="/" 
                        element={<DatabaseSelection onSelect={handleDbSelection} />} 
                    />
                    <Route 
                        path="/sql" 
                        element={dbType === 'SQL' ? <SQLInterface /> : <Navigate to="/" />} 
                    />
                    <Route 
                        path="/nosql" 
                        element={dbType === 'NoSQL' ? <NoSQLInterface /> : <Navigate to="/" />} 
                    />
                    <Route 
                        path="/cluster" 
                        element={<ClusterManager />} 
                    />
                    
                </Routes>
            </div>
        </Router>
    );
}

export default App;
