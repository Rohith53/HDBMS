import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './DocumentEditor.css';
import { fetchDocumentById, updateDocument } from '../components/api.jsx';

// DocumentEditor Component
function DocumentEditor({ databaseName, collectionName, documentId, onClose }) {
    const [documentData, setDocumentData] = useState({});
    const [editFields, setEditFields] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch document by ID on component mount
        const getDocumentData = async () => {
            try {
                setLoading(true); // Set loading state while fetching data
                const doc = await fetchDocumentById(databaseName, collectionName, documentId);
                setDocumentData(doc);
                setEditFields(doc);  // Initialize edit fields with the document's existing data
                setLoading(false);
            } catch (error) {
                setError('Error fetching document data. Please try again.');
                console.error(error);
                setLoading(false);
            }
        };
        getDocumentData();
    }, [databaseName, collectionName, documentId]);

    // Handles changes to document fields
    const handleFieldChange = (field, value) => {
        setEditFields({
            ...editFields,
            [field]: value,
        });
    };

    // Adds a new field to the document (enhancement)
    const handleAddField = () => {
        const newField = prompt("Enter the new field name:");
        if (newField && !editFields.hasOwnProperty(newField)) {
            setEditFields({ ...editFields, [newField]: '' });
        } else {
            setError("Field already exists or invalid name");
        }
    };

    // Deletes a field from the document (enhancement)
    const handleDeleteField = (field) => {
        const updatedFields = { ...editFields };
        delete updatedFields[field];
        setEditFields(updatedFields);
    };

    // Submits updated document data
    const handleUpdateDocument = async () => {
        setError('');
        setSuccess(false);
        try {
            await updateDocument(databaseName, collectionName, documentId, editFields);
            setSuccess(true);
            setDocumentData(editFields);  // Update current document data with changes
        } catch (error) {
            setError('Error updating document. Please try again.');
            console.error(error);
        }
    };

    if (loading) return <div>Loading document...</div>;

    return (
        <div className="document-editor">
            <h2>Editing Document ID: {documentId}</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Document updated successfully!</div>}

            {/* Render form fields for each document attribute */}
            <div className="document-fields">
                {Object.keys(editFields).map((key) => (
                    <div className="field-group" key={key}>
                        <label>{key}</label>
                        <input
                            type="text"
                            value={editFields[key]}
                            onChange={(e) => handleFieldChange(key, e.target.value)}
                        />
                        <button onClick={() => handleDeleteField(key)} className="delete-field-button">
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            {/* Button to add new fields */}
            <div className="add-field">
                <button onClick={handleAddField}>Add New Field</button>
            </div>

            <div className="editor-actions">
                <button onClick={handleUpdateDocument}>Save Changes</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

DocumentEditor.propTypes = {
    databaseName: PropTypes.string.isRequired,
    collectionName: PropTypes.string.isRequired,
    documentId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default DocumentEditor;