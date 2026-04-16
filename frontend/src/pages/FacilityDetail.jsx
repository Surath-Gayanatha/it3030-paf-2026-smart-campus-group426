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

  // Added dynamic images logic for unique look
  const galleryImages = [
    resource.imageUrl,
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800'
  ].filter(img => img);

  return (
    <div className="resources-page" style={{ background: '#fcfcfd' }}>
      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
        <Link to="/resources" className="back-link" style={{ 
          marginBottom: '2rem', 
          display: 'inline-flex', 
          alignItems: 'center',
          gap: '0.5rem',
          color: '#64748b',
          fontWeight: '600',
          textDecoration: 'none'
        }}>
          <span style={{ fontSize: '1.2rem' }}>←</span> Back to Facilities
        </Link>
        
        <div className="facility-detail-hero" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <div className="facility-detail-grid" style={{ minHeight: 'auto', gap: '3rem' }}>
            <div className="facility-detail-image">
              <img 
                src={resource.imageUrl || 'https://via.placeholder.com/800x500?text=No+Image'} 
                alt={resource.name} 
                className="detail-main-img"
              />
              
              <div className="image-gallery-grid">
                {galleryImages.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt="Gallery" 
                    className={`gallery-thumb ${idx === 0 ? 'active' : ''}`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="facility-detail-info" style={{ padding: 0 }}>
              <span className="section-label" style={{ 
                letterSpacing: '2px', 
                color: '#ffd700', 
                fontWeight: '700',
                fontSize: '0.8rem',
                textTransform: 'uppercase'
              }}>{resource.type}</span>
              <h1 className="detail-title" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>{resource.name}</h1>
              
              <div className="detail-meta" style={{ marginBottom: '2rem' }}>
                <div className="detail-meta-item">
                  <span className="meta-icon">📍</span>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: '#94a3b8' }}>LOCATION</strong>
                    <p style={{ fontWeight: '600' }}>{resource.location}</p>
                  </div>
                </div>
                <div className="detail-meta-item">
                  <span className="meta-icon">👥</span>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: '#94a3b8' }}>CAPACITY</strong>
                    <p style={{ fontWeight: '600' }}>{resource.capacity} People</p>
                  </div>
                </div>
              </div>

              <div className="description-card">
                <h3>About this space</h3>
                <p>{resource.description || 'This facility provides a modern and comfortable environment designed to enhance your productivity and learning experience. Equipped with high-speed Wi-Fi and ergonomic furniture.'}</p>
                
                <div className="amenities-list">
                  <div className="amenity-item"><span>🚀</span> High-speed Wi-Fi</div>
                  <div className="amenity-item"><span>📽️</span> Projector Support</div>
                  <div className="amenity-item"><span>❄️</span> Air Conditioned</div>
                  <div className="amenity-item"><span>🔌</span> Power Outlets</div>
                </div>
              </div>

              {resource.availabilityWindows?.length > 0 && (
                <div className="detail-availability" style={{ marginTop: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Available Time Slots</h3>
                  <div className="availability-grid">
                    {resource.availabilityWindows.map((slot) => (
                      <span key={slot} className="availability-tag">{slot}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-actions">
                <button className="btn btn--primary" style={{ padding: '1rem 3rem', borderRadius: '50px' }}>
                  Book This Space Now
                </button>
                <button className="btn btn--secondary" style={{ padding: '1rem 2rem', borderRadius: '50px', background: 'transparent', border: '1px solid #e2e8f0' }}>
                  Check Rules
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