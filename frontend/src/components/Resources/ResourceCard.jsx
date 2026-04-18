import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const slugify = (value = '') => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const getStatusMeta = (status) => {
  switch (status) {
    case 'ACTIVE':
      return { label: 'AVAILABLE', className: 'available' };
    case 'OUT_OF_SERVICE':
      return { label: 'MAINTENANCE', className: 'maintenance' };
    default:
      return {
        label: status ? status.replace('_', ' ') : 'UNKNOWN',
        className: status ? slugify(status) : 'unknown',
      };
  }
};

const ResourceCard = ({ resource }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const resourceClass = slugify(resource.name) || 'item';
  const statusMeta = getStatusMeta(resource.status);
  const statusLabel = statusMeta.label;
  const statusClass = statusMeta.className;
  const availabilityWindows = resource.availabilityWindows || [];
  const isAdmin = !loading && user?.role === 'ADMIN';

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete ${resource.name}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/resources/${resource.id}`);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting resource:', error);
      window.alert('Unable to delete this facility right now.');
    }
  };

  return (
    <div className={`resource-card resource-card--${resourceClass}`}>
      <div className="resource-card__image-container">
        <img 
          src={resource.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={resource.name} 
          className="resource-card__image"
        />
        <div className={`resource-card__status resource-card__status--${statusClass}`}>
          {statusLabel}
        </div>
      </div>
      <div className="resource-card__content">
        <div className="resource-card__header">
          <span className="resource-card__type">{resource.type}</span>
          <h3 className="resource-card__title">{resource.name}</h3>
        </div>
        <div className="resource-card__details">
          <div className="resource-detail">
            <span className="resource-detail__icon">📍</span>
            <span className="resource-detail__text">{resource.location}</span>
          </div>
          <div className="resource-detail">
            <span className="resource-detail__icon">👥</span>
            <span className="resource-detail__text">Capacity: {resource.capacity}</span>
          </div>
        </div>
        <p className="resource-card__description">{resource.description}</p>
        {availabilityWindows.length > 0 && (
          <div className="resource-card__availability">
            <span className="resource-card__availability-label">Availability</span>
            <div className="resource-card__availability-list">
              {availabilityWindows.map((window) => (
                <span key={window} className="resource-card__availability-pill">{window}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            style={{ flex: 1, minWidth: '140px', justifyContent: 'center' }}
            onClick={() => navigate(`/facilities/${resource.id}`)}
          >
            View facility
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              style={{
                flex: 1,
                minWidth: '140px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 28px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9375rem',
                fontWeight: 600,
                backgroundColor: '#dc2626',
                color: '#fff',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              Delete facility
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
