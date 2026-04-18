import { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const rowLabelMap = {
  bookingApproved: 'Booking Approved',
  bookingRejected: 'Booking Rejected',
  bookingCancelled: 'Booking Cancelled',
  ticketStatusChanged: 'Ticket Status Changes',
  newComment: 'New Comments',
};

const initialPreferences = {
  bookingApproved: true,
  bookingRejected: true,
  bookingCancelled: true,
  ticketStatusChanged: true,
  newComment: true,
};

const NotificationPreferences = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 3000);
  };

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let cancelled = false;

    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const response = await api.get('/notifications/preferences');
        if (!cancelled) {
          setPreferences({
            bookingApproved: !!response.data?.bookingApproved,
            bookingRejected: !!response.data?.bookingRejected,
            bookingCancelled: !!response.data?.bookingCancelled,
            ticketStatusChanged: !!response.data?.ticketStatusChanged,
            newComment: !!response.data?.newComment,
          });
        }
      } catch (error) {
        if (!cancelled) {
          showToast('error', 'Failed to load notification preferences.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPreferences();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/notifications/preferences', preferences);
      showToast('success', 'Notification preferences saved successfully.');
    } catch (error) {
      showToast('error', 'Failed to save notification preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#475569',
        fontSize: '1rem',
        fontWeight: 600,
      }}>
        Loading notification preferences...
      </div>
    );
  }

  return (
    <section style={{
      minHeight: 'calc(100vh - 80px)',
      background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 60%)',
      padding: '32px 16px 48px',
    }}>
      <div style={{
        maxWidth: '920px',
        margin: '0 auto',
      }}>
        <div style={{
          marginBottom: '18px',
        }}>
          <h1 style={{
            margin: 0,
            color: '#1e293b',
            fontSize: '1.85rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}>
            Notification Preferences
          </h1>
          <p style={{
            margin: '8px 0 0 0',
            color: '#64748b',
            fontSize: '0.95rem',
          }}>
            Choose which activity updates you want to receive.
          </p>
        </div>

        {toast.message && (
          <div style={{
            marginBottom: '14px',
            borderRadius: '10px',
            padding: '12px 14px',
            border: toast.type === 'success' ? '1px solid #86efac' : '1px solid #fca5a5',
            background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: toast.type === 'success' ? '#166534' : '#991b1b',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}>
            {toast.message}
          </div>
        )}

        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{
                  textAlign: 'left',
                  padding: '14px 18px',
                  color: '#475569',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Notification Type
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: '14px 18px',
                  color: '#475569',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  width: '180px',
                }}>
                  Enabled
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rowLabelMap).map(([key, label]) => (
                <tr key={key} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{
                    padding: '16px 18px',
                    color: '#1e293b',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                  }}>
                    {label}
                  </td>
                  <td style={{
                    padding: '16px 18px',
                    textAlign: 'center',
                  }}>
                    <button
                      type="button"
                      onClick={() => handleToggle(key)}
                      style={{
                        width: '50px',
                        height: '28px',
                        borderRadius: '999px',
                        border: preferences[key] ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        background: preferences[key] ? '#2563eb' : '#e2e8f0',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        padding: 0,
                      }}
                      aria-pressed={preferences[key]}
                      aria-label={`Toggle ${label}`}
                    >
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        left: preferences[key] ? '24px' : '2px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
                        transition: 'left 0.2s ease',
                      }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: '18px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              border: 'none',
              borderRadius: '10px',
              background: saving ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 700,
              padding: '11px 18px',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 10px 20px rgba(37, 99, 235, 0.25)',
            }}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default NotificationPreferences;
