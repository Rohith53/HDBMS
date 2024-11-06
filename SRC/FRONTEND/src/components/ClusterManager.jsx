import React, { useEffect, useState } from 'react';
import './ClusterManager.css'; // Optional CSS for styling
import { fetchClusters, createCluster, deleteCluster } from './api.jsx'; // Adjust imports according to your API structure

// ClusterManager Component
function ClusterManager() {
    const [clusters, setClusters] = useState([]);
    const [newClusterName, setNewClusterName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch clusters on component mount
    useEffect(() => {
        loadClusters();
    }, []);

    // Load clusters from the database
    const loadClusters = async () => {
        setLoading(true);
        setError('');
        try {
            const fetchedClusters = await fetchClusters();
            setClusters(fetchedClusters);
        } catch (error) {
            setError('Error fetching clusters. Please try again.');
            console.error('Error fetching clusters:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle new cluster creation
    const handleCreateCluster = async () => {
        if (!newClusterName.trim()) {
            setError('Cluster name cannot be empty.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await createCluster(newClusterName);
            setSuccessMessage('Cluster created successfully!');
            setNewClusterName(''); // Reset input field
            loadClusters(); // Refresh clusters list
        } catch (error) {
            setError('Error creating cluster. Please try again.');
            console.error('Error creating cluster:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle cluster deletion
    const handleDeleteCluster = async (clusterName) => {
        if (window.confirm(`Are you sure you want to delete the cluster: ${clusterName}?`)) {
            setLoading(true);
            setError('');
            try {
                await deleteCluster(clusterName);
                setSuccessMessage('Cluster deleted successfully!');
                loadClusters(); // Refresh clusters list
            } catch (error) {
                setError('Error deleting cluster. Please try again.');
                console.error('Error deleting cluster:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="cluster-manager">
            <h2>Cluster Manager</h2>
            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}
            {successMessage && <div className="success">{successMessage}</div>}

            <div className="create-cluster">
                <h3>Create New Cluster</h3>
                <input
                    type="text"
                    value={newClusterName}
                    onChange={(e) => setNewClusterName(e.target.value)}
                    placeholder="Enter cluster name"
                />
                <button onClick={handleCreateCluster}>Create Cluster</button>
            </div>

            <div className="existing-clusters">
                <h3>Existing Clusters</h3>
                {clusters.length === 0 ? (
                    <p>No clusters available.</p>
                ) : (
                    <ul>
                        {clusters.map((cluster) => (
                            <li key={cluster}>
                                {cluster} 
                                <button onClick={() => handleDeleteCluster(cluster)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default ClusterManager;