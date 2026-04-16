import React from 'react';

const ResourceCard = ({ resource }) => {
  const statusLabel = resource.status ? resource.status.replace('_', ' ') : 'UNKNOWN';
  const statusClass = resource.status ? resource.status.toLowerCase() : 'unknown';
  const availabilityWindows = resource.availabilityWindows || [];

  return (
    <div className="resource-card">
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
          <button className="btn btn--primary btn--sm">View facility</button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
