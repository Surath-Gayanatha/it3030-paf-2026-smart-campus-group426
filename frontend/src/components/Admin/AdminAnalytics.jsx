import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/resources/analytics');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (!analytics) return <div>No analytics available.</div>;

  return (
    <div className="admin-analytics">
      <h2 className="admin-section-title">Usage Analytics</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Top Resources</h3>
          <ul className="analytics-list">
            {analytics.topResources.map((res, index) => (
              <li key={index} className="analytics-item">
                <span className="item-name">{res.name}</span>
                <span className="item-value">{res.usageCount} bookings</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="analytics-card">
          <h3>Peak Booking Hours</h3>
          <div className="peak-hours-chart">
            {analytics.peakHours.map((hour, index) => (
              <div key={index} className="hour-bar-container">
                <div 
                  className="hour-bar" 
                  style={{ height: `${(hour.bookings / 30) * 100}%` }}
                >
                  <span className="hour-label">{hour.bookings}</span>
                </div>
                <span className="hour-time">{hour.hour}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card stats-summary">
          <h3>Summary</h3>
          <div className="stat-row">
            <span>Total Resources</span>
            <strong>{analytics.totalResources}</strong>
          </div>
          <div className="stat-row">
            <span>Utilization Rate</span>
            <strong>74%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
