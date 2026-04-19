import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle2, AlertCircle, 
  Trash2, MailOpen, Clock, 
  ShieldCheck, Wrench, Info, X, 
  Search, ChevronRight, Activity, Calendar, XCircle
} from 'lucide-react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); 
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      setError('System notifications currently unavailable.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) { console.error(err); }
  };

  const getTimeAgo = (value) => {
    if (!value) return 'Just now';
    const created = new Date(value);
    const now = new Date();
    const diffS = Math.floor((now.getTime() - created.getTime()) / 1000);
    if (diffS < 60) return 'Just now';
    const diffM = Math.floor(diffS / 60);
    if (diffM < 60) return `${diffM}m ago`;
    const diffH = Math.floor(diffM / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH/24)}d ago`;
  };

  const getIcon = (type) => {
    const iconProps = { size: 18, strokeWidth: 2 };
    switch (type) {
      case 'TICKET_ASSIGNED':       return <Wrench {...iconProps} style={{ color: '#2563EB' }} />;
      case 'TICKET_STATUS_CHANGED': return <CheckCircle2 {...iconProps} style={{ color: '#059669' }} />;
      case 'BOOKING_APPROVED':      return <CheckCircle2 {...iconProps} style={{ color: '#10B981' }} />;
      case 'BOOKING_REJECTED':      return <XCircle {...iconProps} style={{ color: '#EF4444' }} />;
      case 'BOOKING_CANCELLED':     return <AlertCircle {...iconProps} style={{ color: '#F59E0B' }} />;
      case 'ROLE_REVIEW':           return <ShieldCheck {...iconProps} style={{ color: '#4F46E5' }} />;
      case 'NEW_COMMENT':           return <Info {...iconProps} style={{ color: '#D97706' }} />;
      default:                      return <Bell {...iconProps} style={{ color: '#475569' }} />;
    }
  };

  const filteredItems = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'UNREAD') return !n.read;
    if (activeFilter === 'TICKETS') return n.type?.includes('TICKET') || n.type === 'NEW_COMMENT';
    if (activeFilter === 'BOOKINGS') return n.type?.includes('BOOKING');
    if (activeFilter === 'SYSTEM') return n.type === 'ROLE_REVIEW';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ minHeight: '100vh', background: '#FDFDFD', color: '#1E293B' }}>
      {/* ── Elegant Header ── */}
      <div style={{ 
        background: 'linear-gradient(to bottom, #F8FAFC 0%, #FFFFFF 100%)',
        borderBottom: '1px solid #F1F5F9',
        padding: '60px 0 100px',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '64px', height: '64px', background: '#FFFFFF', borderRadius: '18px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          border: '1px solid #E2E8F0'
        }}>
          <Activity size={28} color="#1E3A8A" />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 8px', color: '#0F172A', letterSpacing: '-0.025em' }}>
          Notification Center
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: '500px', margin: '0 auto' }}>
          A sophisticated overview of your campus activities and alerts.
        </p>
      </div>

      {/* ── Main Workspace ── */}
      <div style={{ maxWidth: '840px', margin: '-50px auto 0', padding: '0 24px' }}>
        <div style={{ 
          background: '#FFFFFF', borderRadius: '24px', padding: '32px', 
          boxShadow: '0 20px 60px -12px rgba(0,0,0,0.08)', border: '1px solid #F1F5F9'
        }}>
          
          {/* Refined Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', background: '#F8FAFC', padding: '4px', borderRadius: '14px', border: '1px solid #F1F5F9' }}>
              {['ALL', 'UNREAD', 'TICKETS', 'BOOKINGS', 'SYSTEM'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600,
                    background: activeFilter === f ? '#FFFFFF' : 'transparent',
                    color: activeFilter === f ? '#1E3A8A' : '#64748B',
                    boxShadow: activeFilter === f ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()} 
                  {f === 'UNREAD' && unreadCount > 0 && (
                    <span style={{ marginLeft: '4px', background: '#1E3A8A', color: '#FFF', padding: '1px 6px', borderRadius: '99px', fontSize: '0.7rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button 
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#1E3A8A', opacity: unreadCount === 0 ? 0.4 : 1 }}
            >
              <MailOpen size={16} /> Mark all read
            </button>
          </div>

          {/* Elegant Search */}
          <div style={{ position: 'relative', marginBottom: '32px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search activities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', 
                border: '1px solid #E2E8F0', fontSize: '0.95rem', outline: 'none', 
                background: '#FDFDFD', transition: 'all 0.2s', color: '#1E293B'
              }}
            />
          </div>

          {/* Logic Area */}
          {error ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <AlertCircle size={40} color="#EF4444" style={{ marginBottom: '16px' }} />
              <p style={{ fontWeight: 600, color: '#DC2626' }}>{error}</p>
              <button onClick={fetchNotifications} style={{ marginTop: '16px', color: '#1E3A8A', fontWeight: 700 }}>Try reaching server again</button>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: '32px', height: '32px', border: '2px solid #F1F5F9', borderTopColor: '#1E3A8A', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: '0.9rem', color: '#64748B' }}>Fetching updates...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Bell size={40} color="#E2E8F0" style={{ marginBottom: '16px' }} />
              <p style={{ color: '#64748B', fontWeight: 500 }}>All notifications caught up.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredItems.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    handleMarkAsRead(n.id);
                    if (n.referenceId) {
                      const path = n.type?.includes('BOOKING') ? '/bookings' : `/tickets/${n.referenceId}`;
                      navigate(path);
                    }
                  }}
                  style={{
                    display: 'flex', gap: '18px', padding: '20px 24px',
                    background: '#FFFFFF', borderRadius: '16px',
                    border: '1px solid #F1F5F9', transition: 'all 0.2s ease',
                    cursor: 'pointer', position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#F1F5F9'; }}
                >
                  {!n.read && (
                    <div style={{ position: 'absolute', left: '10px', top: '24px', width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB' }} />
                  )}
                  
                  <div style={{ 
                    width: '44px', height: '44px', borderRadius: '12px', 
                    background: n.read ? '#F8FAFC' : '#EFF6FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, border: '1px solid #F1F5F9'
                  }}>
                    {getIcon(n.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '2px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>{n.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', flexShrink: 0, marginTop: '2px' }}>{getTimeAgo(n.createdAt)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5' }}>{n.message}</p>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                    style={{ padding: '8px', borderRadius: '8px', color: '#E2E8F0', alignSelf: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#E2E8F0'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
