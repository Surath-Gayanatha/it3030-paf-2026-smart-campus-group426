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
        // Fallback mock data if API fails or resource not found in DB
        const mockFacilities = {
          '1': { id: '1', name: 'Premium Innovation Hub', type: 'STUDY_ROOM', location: 'SLIIT Malabe - New Building', capacity: 15, description: 'A state-of-the-art innovation hub designed for collaborative projects and high-tech research.', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200', availabilityWindows: ['08:00 - 10:00', '13:00 - 15:00'] },
          '2': { id: '2', name: 'Grand Auditorium', type: 'COUNCIL_ROOM', location: 'SLIIT Malabe - Main Hall', capacity: 500, description: 'A massive space perfect for graduation ceremonies, guest lectures, and large-scale campus events.', imageUrl: 'https://images.unsplash.com/photo-1505373633560-fa9012857ff0?auto=format&fit=crop&q=80&w=1200', availabilityWindows: ['09:00 - 12:00'] },
          '3': { id: '3', name: 'Quiet Study Lounge', type: 'LIBRARY_ZONE', location: 'SLIIT Metro Campus', capacity: 30, description: 'The perfect place for deep focus and silent study sessions with ergonomic seating and plenty of power outlets.', imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200', availabilityWindows: ['All Day'] }
        };
        if (mockFacilities[id]) {
          setResource(mockFacilities[id]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  if (loading) return <div className="loading-spinner">Loading facility details...</div>;
  
  // Use fallbacks for image and description if they are missing
  const displayImage = resource?.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200';
  const displayDesc = resource?.description || 'This premium facility offers a modern and sleek environment, perfect for students and staff. It features high-speed connectivity, ergonomic interiors, and a quiet atmosphere conducive to both individual study and group collaboration.';

  if (!resource) return (
    <div className="resources-page">
      <div className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>
        <h2>Facility details are currently being updated.</h2>
        <p>Please check back in a few moments or explore other facilities.</p>
        <Link to="/resources" className="btn btn--primary" style={{ marginTop: '2rem' }}>Return to Catalog</Link>
      </div>
    </div>
  );

  // Added dynamic images logic for unique look
  const galleryImages = [
    displayImage,
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517502884422-41eaadeff171?auto=format&fit=crop&q=80&w=800'
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
                src={displayImage} 
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
                <p>{displayDesc}</p>
                
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