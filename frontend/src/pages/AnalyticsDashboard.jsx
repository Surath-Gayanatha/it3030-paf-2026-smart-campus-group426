import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, ShieldCheck, RefreshCw, 
  AlertCircle, LayoutDashboard, Target
} from 'lucide-react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import TicketAnalyticsBoard from '../components/Ticket/TicketAnalyticsBoard';

const AnalyticsDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/tickets/stats');
      setStats(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load performance metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchStats();
    }
  }, [authLoading, user, fetchStats]);

  if (authLoading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#64748B' }}>
      Verifying access credentials...
    </div>
  );

  if (error) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#EF4444' }}>
      <AlertCircle size={48} style={{ marginBottom: '16px' }} />
      <p style={{ fontWeight: 600 }}>{error}</p>
      <button onClick={fetchStats} className="btn-refresh" style={{ marginTop: '12px', padding: '8px 20px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
        Try Again
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px 32px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: '40px', flexWrap: 'wrap', gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366F1, #818CF8)',
              padding: '8px', borderRadius: '10px', color: '#FFF', display: 'flex'
            }}>
              <LayoutDashboard size={18} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366F1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Maintenance Intelligence
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1E293B', margin: 0, letterSpacing: '-0.02em' }}>
            {user?.role === 'ADMIN' ? 'Operational Overview' : 'Performance Insights'}
          </h1>
          <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '8px' }}>
            {user?.role === 'ADMIN' 
              ? 'Real-time analytical summary of campus-wide maintenance performance.' 
              : 'Statistical overview of your ticket resolution efficiency and workload.'}
          </p>
        </div>
        
        <button 
          onClick={fetchStats}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', background: '#FFF', border: '1px solid #E2E8F0',
            borderRadius: '12px', color: '#1E293B', fontWeight: 600, fontSize: '0.9rem',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
          onMouseLeave={e => e.currentTarget.style.background = '#FFF'}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Analytics Board */}
      <TicketAnalyticsBoard stats={stats} role={user?.role} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
