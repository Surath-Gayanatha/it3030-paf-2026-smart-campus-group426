import React from 'react';
import { useNavigate } from 'react-router-dom';

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
  const resourceClass = slugify(resource.name) || 'item';
  const statusMeta = getStatusMeta(resource.status);
  const statusLabel = statusMeta.label;
  const statusClass = statusMeta.className;
  const availabilityWindows = resource.availabilityWindows || [];

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
        <div className="resource-card__footer">
          <button 
            className="btn btn--primary btn--sm"
            onClick={() => navigate(`/facilities/${resource.id}`)}
          >
            View facility
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
