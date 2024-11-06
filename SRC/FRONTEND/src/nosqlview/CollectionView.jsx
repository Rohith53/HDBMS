import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './CollectionView.css';
import { fetchCollections, fetchDocuments, createDocument, updateDocument, deleteDocument } from '../components/api.jsx';

// CollectionView Component
function CollectionView({ databaseName }) {
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [documentForm, setDocumentForm] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch all collections for the selected database
        const getCollections = async () => {
            try {
                const collectionList = await fetchCollections(databaseName);
                setCollections(collectionList);
            } catch (error) {
                setError('Error fetching collections. Please try again.');
                console.error(error);
            }
        };

        getCollections();
    }, [databaseName]);

    // Fetches documents in a collection
    const handleSelectCollection = async (collectionName) => {
        setSelectedCollection(collectionName);
        setError('');
        try {
            const docs = await fetchDocuments(databaseName, collectionName);
            setDocuments(docs);
        } catch (error) {
            setError('Error fetching documents. Please try again.');
            console.error(error);
        }
    };

    // Handles input change in the document form
    const handleDocumentFormChange = (field, value) => {
        setDocumentForm({
            ...documentForm,
            [field]: value,
        });
    };

    // Adds a new document
    const handleAddDocument = async () => {
        try {
            const newDoc = await createDocument(databaseName, selectedCollection, documentForm);
            setDocuments([...documents, newDoc]);
            setDocumentForm({});
        } catch (error) {
            setError('Error creating document. Please try again.');
            console.error(error);
        }
    };

    // Updates an existing document
    const handleUpdateDocument = async (docId, updatedFields) => {
        try {
            const updatedDoc = await updateDocument(databaseName, selectedCollection, docId, updatedFields);
            setDocuments(
                documents.map((doc) => (doc._id === docId ? updatedDoc : doc))
            );
        } catch (error) {
            setError('Error updating document. Please try again.');
            console.error(error);
        }
    };

    // Deletes a document
    const handleDeleteDocument = async (docId) => {
        try {
            await deleteDocument(databaseName, selectedCollection, docId);
            setDocuments(documents.filter((doc) => doc._id !== docId));
        } catch (error) {
            setError('Error deleting document. Please try again.');
            console.error(error);
        }
    };

    return (
        <div className="collection-view">
            <h2>Collections in {databaseName}</h2>
            
            {error && <div className="error-message">{error}</div>}

            {/* Collection List */}
            <div className="collection-list">
                <h3>Available Collections</h3>
                {collections.map((collection) => (
                    <button
                        key={collection}
                        className={`collection-button ${collection === selectedCollection ? 'selected' : ''}`}
                        onClick={() => handleSelectCollection(collection)}
                    >
                        {collection}
                    </button>
                ))}
            </div>

            {/* Document List */}
            {selectedCollection && (
                <div className="document-list">
                    <h3>Documents in {selectedCollection}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Data</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc) => (
                                <tr key={doc._id}>
                                    <td>{doc._id}</td>
                                    <td>
                                        {Object.keys(doc).map((key) => (
                                            key !== '_id' && (
                                                <div key={key}>
                                                    <strong>{key}:</strong> {doc[key].toString()}
                                                </div>
                                            )
                                        ))}
                                    </td>
                                    <td>
                                        <button onClick={() => handleUpdateDocument(doc._id, documentForm)}>
                                            Update
                                        </button>
                                        <button onClick={() => handleDeleteDocument(doc._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Document Form */}
            {selectedCollection && (
                <div className="document-form">
                    <h3>Add New Document</h3>
                    {Object.keys(documentForm).map((field) => (
                        <input
                            key={field}
                            type="text"
                            placeholder={`Enter ${field}`}
                            value={documentForm[field]}
                            onChange={(e) => handleDocumentFormChange(field, e.target.value)}
                        />
                    ))}
                    <button onClick={handleAddDocument}>Add Document</button>
                </div>
            )}
        </div>
    );
}

CollectionView.propTypes = {
    databaseName: PropTypes.string.isRequired,
};

export default CollectionView;
