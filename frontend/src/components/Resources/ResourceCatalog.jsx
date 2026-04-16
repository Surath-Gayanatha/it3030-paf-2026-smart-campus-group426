import React, { useEffect, useState } from 'react';
import api from '../../utils/axiosConfig';
import ResourceCard from './ResourceCard';

const ResourceCatalog = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    minCapacity: ''
  });

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.location) params.append('location', filters.location);
      if (filters.minCapacity) params.append('capacity', filters.minCapacity);
      
      const response = await api.get(`/resources/search?${params.toString()}`);
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="resources" className="resource-catalog">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Facilities & Assets</h2>
          <p className="section-subtitle">Discover the best tools and spaces for your academic journey.</p>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label>Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Lab">Lab</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Location</label>
            <input 
              type="text" 
              name="location" 
              placeholder="Filter by location" 
              value={filters.location} 
              onChange={handleFilterChange} 
            />
          </div>
          <div className="filter-group">
            <label>Min Capacity</label>
            <input 
              type="number" 
              name="minCapacity" 
              placeholder="e.g. 10" 
              value={filters.minCapacity} 
              onChange={handleFilterChange} 
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading resources...</div>
        ) : (
          <div className="resource-grid">
            {resources.length > 0 ? (
              resources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : (
              <div className="no-results">
                <h3>No facilities found</h3>
                <p>Try a different filter or add a new facility using the form on the right.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ResourceCatalog;
