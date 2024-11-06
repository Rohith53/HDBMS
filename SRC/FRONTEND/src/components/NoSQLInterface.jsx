import React, { useEffect, useState } from 'react';
import './NoSQLInterface.css'; // Optional CSS for styling
import { fetchCollections, executeNoSQLQuery, createDocument, deleteDocument, updateDocument } from './api.jsx'; // Adjust imports as per your API structure
import CollectionView from '../nosqlview/CollectionView.jsx'; // Import CollectionView for displaying collection data

// NoSQLInterface Component
function NoSQLInterface() {
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState('');
    const [newDocument, setNewDocument] = useState({});
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch collections on component mount
    useEffect(() => {
        loadCollections();
    }, []);

    // Load collections from the NoSQL database
    const loadCollections = async () => {
        setLoading(true);
        try {
            const fetchedCollections = await fetchCollections();
            setCollections(fetchedCollections);
        } catch (error) {
            setError('Error fetching collections. Please try again.');
            console.error('Error fetching collections:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle NoSQL query execution
    const handleExecuteQuery = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await executeNoSQLQuery(query);
            setResponse(result);
            setQuery(''); // Reset query input after execution
        } catch (error) {
            setError('Error executing query. Please check your NoSQL syntax.');
            console.error('Error executing query:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle document creation
    const handleCreateDocument = async () => {
        setError('');
        if (Object.keys(newDocument).length === 0) {
            setError('Document cannot be empty.');
            return;
        }
        try {
            await createDocument(selectedCollection, newDocument);
            setNewDocument({}); // Reset document input
            loadCollections(); // Refresh collections
        } catch (error) {
            setError('Error creating document. Please try again.');
            console.error('Error creating document:', error);
        }
    };

    // Handle document deletion
    const handleDeleteDocument = async (id) => {
        if (window.confirm(`Are you sure you want to delete the document with ID ${id}?`)) {
            setLoading(true);
            try {
                await deleteDocument(selectedCollection, id);
                loadCollections(); // Refresh collections
            } catch (error) {
                setError('Error deleting document. Please try again.');
                console.error('Error deleting document:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle document update
    const handleUpdateDocument = async (id, updatedDoc) => {
        setError('');
        try {
            await updateDocument(selectedCollection, id, updatedDoc);
            loadCollections(); // Refresh collections
        } catch (error) {
            setError('Error updating document. Please try again.');
            console.error('Error updating document:', error);
        }
    };

    return (
        <div className="nosql-interface">
            <h2>NoSQL Interface</h2>
            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}

            <div className="collection-management">
                <h3>Manage Collections</h3>
                <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                >
                    <option value="">Select a Collection</option>
                    {collections.map((collection) => (
                        <option key={collection} value={collection}>
                            {collection}
                        </option>
                    ))}
                </select>

                <div className="create-document">
                    <h4>Create Document</h4>
                    <textarea
                        rows="5"
                        value={JSON.stringify(newDocument, null, 2)}
                        onChange={(e) => setNewDocument(JSON.parse(e.target.value || '{}'))}
                        placeholder="Enter document JSON here..."
                    />
                    <button onClick={handleCreateDocument}>Create Document</button>
                </div>

                <div className="query-execution">
                    <h3>Execute NoSQL Query</h3>
                    <textarea
                        rows="5"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter NoSQL query here..."
                    />
                    <button onClick={handleExecuteQuery}>Run Query</button>

                    <h4>Response</h4>
                    {response ? (
                        <CollectionView data={response} onDelete={handleDeleteDocument} onUpdate={handleUpdateDocument} />
                    ) : (
                        <pre className="response">No response yet.</pre>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NoSQLInterface;