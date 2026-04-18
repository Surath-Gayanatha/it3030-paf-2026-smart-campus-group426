import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'Lecture Hall',
    capacity: 0,
    location: '',
    description: '',
    status: 'ACTIVE'
  });

  const fetchResources = async () => {
    try {
      const response = await api.get('/resources');
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      await api.post('/resources', newResource);
      setIsAdding(false);
      fetchResources();
      setNewResource({
        name: '',
        type: 'Lecture Hall',
        capacity: 0,
        location: '',
        description: '',
        status: 'ACTIVE'
      });
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await api.delete(`/resources/${id}`);
        fetchResources();
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  return (
    <div className="resource-management">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Resource Management</h2>
        <button className="btn btn--primary" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : 'Add New Resource'}
        </button>
      </div>

      {isAdding && (
        <form className="resource-form" onSubmit={handleAddResource}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                required 
                value={newResource.name} 
                onChange={(e) => setNewResource({...newResource, name: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select 
                value={newResource.type} 
                onChange={(e) => setNewResource({...newResource, type: e.target.value})}
              >
                <option value="Lecture Hall">Lecture Hall</option>
                <option value="Lab">Lab</option>
                <option value="Meeting Room">Meeting Room</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input 
                type="number" 
                value={newResource.capacity} 
                onChange={(e) => setNewResource({...newResource, capacity: parseInt(e.target.value)})} 
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input 
                type="text" 
                required 
                value={newResource.location} 
                onChange={(e) => setNewResource({...newResource, location: e.target.value})} 
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={newResource.description} 
              onChange={(e) => setNewResource({...newResource, description: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn btn--success">Save Resource</button>
        </form>
      )}

      <div className="resource-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(resource => (
              <tr key={resource.id}>
                <td>{resource.name}</td>
                <td>{resource.type}</td>
                <td>{resource.capacity}</td>
                <td>{resource.location}</td>
                <td>
                  <span className={`status-badge status-badge--${resource.status.toLowerCase()}`}>
                    {resource.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn--icon btn--delete" onClick={() => handleDelete(resource.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceManagement;
