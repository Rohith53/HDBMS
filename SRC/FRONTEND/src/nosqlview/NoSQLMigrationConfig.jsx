// src/frontend/src/components/NoSQLMigrationConfig.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const NoSQLMigrationConfig = () => {
    const [sourceCollection, setSourceCollection] = useState('');
    const [targetMongoDB, setTargetMongoDB] = useState('');
    const [mongoDBLink, setMongoDBLink] = useState(''); // New state for MongoDB link
    const [sourceCollections, setSourceCollections] = useState([]);
    const [mapping, setMapping] = useState({});
    const [previewData, setPreviewData] = useState([]);

    useEffect(() => {
        // Fetch available source collections
        const fetchSourceCollections = async () => {
            try {
                const response = await axios.get('/api/nosql/source-collections');
                setSourceCollections(response.data);
            } catch (error) {
                console.error('Error fetching source collections:', error);
                toast.error('Failed to fetch source collections.');
            }
        };

        fetchSourceCollections();
    }, []);

    const handleMappingChange = (field, value) => {
        setMapping(prevMapping => ({ ...prevMapping, [field]: value }));
    };

    const previewMigration = async () => {
        try {
            const response = await axios.post('/api/nosql/migration/preview', {
                sourceCollection,
                mapping,
            });
            setPreviewData(response.data);
            toast.success('Preview data fetched successfully!');
        } catch (error) {
            console.error('Error fetching preview data:', error);
            toast.error('Failed to fetch preview data.');
        }
    };

    const startMigration = async () => {
        if (!mongoDBLink) {
            toast.error('Please enter the MongoDB database link.');
            return;
        }

        try {
            const response = await axios.post('/api/nosql/migration/start', {
                sourceCollection,
                targetMongoDB,
                mongoDBLink, // Pass MongoDB link to the backend
                mapping,
            });
            toast.success('Migration started successfully!');
        } catch (error) {
            console.error('Error starting migration:', error);
            toast.error('Failed to start migration.');
        }
    };

    return (
        <div className="migration-config-container">
            <h2>NoSQL Migration Configuration</h2>

            <div className="form-group">
                <label htmlFor="sourceCollection">Select Source Collection:</label>
                <select
                    id="sourceCollection"
                    value={sourceCollection}
                    onChange={(e) => setSourceCollection(e.target.value)}
                >
                    <option value="">Select a collection</option>
                    {sourceCollections.map(collection => (
                        <option key={collection} value={collection}>{collection}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="targetMongoDB">Target MongoDB Collection:</label>
                <input
                    type="text"
                    id="targetMongoDB"
                    value={targetMongoDB}
                    onChange={(e) => setTargetMongoDB(e.target.value)}
                    placeholder="Enter target MongoDB collection name"
                />
            </div>

            <div className="form-group">
                <label htmlFor="mongoDBLink">MongoDB Database Link:</label>
                <input
                    type="text"
                    id="mongoDBLink"
                    value={mongoDBLink}
                    onChange={(e) => setMongoDBLink(e.target.value)}
                    placeholder="Enter MongoDB connection link"
                />
            </div>

            <div className="mapping-section">
                <h3>Field Mapping Configuration</h3>
                {Object.keys(mapping).map((field, index) => (
                    <div key={index} className="mapping-row">
                        <label htmlFor={`mapping-${field}`}>{field}:</label>
                        <input
                            type="text"
                            id={`mapping-${field}`}
                            value={mapping[field] || ''}
                            onChange={(e) => handleMappingChange(field, e.target.value)}
                            placeholder="Map this field to target"
                        />
                    </div>
                ))}
            </div>

            <button onClick={previewMigration}>Preview Migration</button>

            <div className="preview-section">
                <h3>Preview Migration Data</h3>
                <pre>{JSON.stringify(previewData, null, 2)}</pre>
            </div>

            <button onClick={startMigration}>Start Migration</button>
        </div>
    );
};

export default NoSQLMigrationConfig;

