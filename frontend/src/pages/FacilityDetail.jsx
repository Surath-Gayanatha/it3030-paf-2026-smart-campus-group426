import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import Footer from '../components/Footer';
import './Resources.css';

const FacilityDetail = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await api.get(`/resources/${id}`);
        setResource(response.data);
      } catch (error) {
        console.error('Error fetching resource details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  if (loading) return <div className="loading-spinner">Loading facility details...</div>;
  if (!resource) return <div className="no-results"><h3>Facility not found</h3></div>;

  return (
    <div className="resources-page">
      <div className="container" style={{ paddingTop: '8rem' }}>
        <Link to="/resources" className="btn-secondary" style={{ marginBottom: '2rem', display: 'inline-block' }}>
          ← Back to Catalog
        </Link>
        
        <div className="facility-detail-hero">
          <div className="facility-detail-grid">
            <div className="facility-detail-image">
              <img 
                src={resource.imageUrl || 'https://via.placeholder.com/800x500?text=No+Image'} 
                alt={resource.name} 
                className="detail-main-img"
              />
            </div>
            
            <div className="facility-detail-info">
              <span className="section-label">{resource.type}</span>
              <h1 className="detail-title">{resource.name}</h1>
              
              <div className="detail-meta">
                <div className="detail-meta-item">
                  <span className="meta-icon">📍</span>
                  <div>
                    <strong>Location</strong>
                    <p>{resource.location}</p>
                  </div>
                </div>
                <div className="detail-meta-item">
                  <span className="meta-icon">👥</span>
                  <div>
                    <strong>Capacity</strong>
                    <p>{resource.capacity} People</p>
                  </div>
                </div>
                <div className="detail-meta-item">
                  <span className="meta-icon">⚡</span>
                  <div>
                    <strong>Status</strong>
                    <p>{resource.status?.replace('_', ' ') || 'ACTIVE'}</p>
                  </div>
                </div>
              </div>

              <div className="detail-description">
                <h3>About this space</h3>
                <p>{resource.description}</p>
              </div>

              {resource.availabilityWindows?.length > 0 && (
                <div className="detail-availability">
                  <h3>Available Time Slots</h3>
                  <div className="availability-grid">
                    {resource.availabilityWindows.map((slot) => (
                      <span key={slot} className="availability-tag">{slot}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-actions">
                <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem' }}>
                  Request Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FacilityDetail;