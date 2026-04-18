import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const timeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return diffMins + ' minutes ago';
  if (diffHours < 24) return diffHours + ' hours ago';
  return diffDays + ' days ago';
};

const getNotificationKind = (type) => {
  if (type?.includes('BOOKING')) return 'BOOKING';
  if (type?.includes('TICKET')) return 'TICKET';
  if (type === 'NEW_COMMENT') return 'COMMENT';
  return 'GENERAL';
};

const typeLabel = (type) => {
  if (!type) return 'General';
  return type.replaceAll('_', ' ');
};

const truncate = (text, max = 60) => {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
};

const getNavigatePath = (notification) => {
  if (!notification?.referenceId) return null;

  const kind = getNotificationKind(notification.type);
  if (kind === 'TICKET' || kind === 'COMMENT') {
    return `/tickets/${notification.referenceId}`;
  }
  if (kind === 'BOOKING') {
    return '/bookings';
  }

  return null;
};

const NotificationsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [relatedDetails, setRelatedDetails] = useState(null);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState('');

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'BOOKINGS') {
      return notifications.filter((n) => n.type?.includes('BOOKING'));
    }
    if (activeFilter === 'TICKETS') {
      return notifications.filter((n) => n.type?.includes('TICKET'));
    }
    if (activeFilter === 'COMMENTS') {
      return notifications.filter((n) => n.type === 'NEW_COMMENT');
    }
    return notifications;
  }, [activeFilter, notifications]);

  const selectedNotification = useMemo(
    () => filteredNotifications.find((n) => n.id === selectedId) || null,
    [filteredNotifications, selectedId]
  );

  const loadNotifications = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
    } catch (requestError) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }
    loadNotifications();
  }, [authLoading, user]);

  useEffect(() => {
    if (!filteredNotifications.length) {
      setSelectedId('');
      return;
    }
    if (!selectedId || !filteredNotifications.some((n) => n.id === selectedId)) {
      setSelectedId(filteredNotifications[0].id);
    }
  }, [filteredNotifications, selectedId]);

  useEffect(() => {
    let cancelled = false;

    const loadRelatedDetails = async () => {
      if (!selectedNotification?.referenceId) {
        setRelatedDetails(null);
        setRelatedError('');
        return;
      }

      const kind = getNotificationKind(selectedNotification.type);
      if (kind !== 'TICKET' && kind !== 'COMMENT' && kind !== 'BOOKING') {
        setRelatedDetails(null);
        setRelatedError('');
        return;
      }

      try {
        setRelatedLoading(true);
        setRelatedError('');

        if (kind === 'TICKET' || kind === 'COMMENT') {
          const response = await api.get(`/tickets/${selectedNotification.referenceId}`);
          if (!cancelled) {
            setRelatedDetails({
              kind: 'TICKET',
              message: response.data?.description || '',
              status: response.data?.status || '',
              category: response.data?.category || '',
              resourceLocation: response.data?.resourceLocation || '',
            });
          }
          return;
        }

        const response = await api.get(`/bookings/${selectedNotification.referenceId}`);
        if (!cancelled) {
          setRelatedDetails({
            kind: 'BOOKING',
            message: response.data?.purpose || '',
            status: response.data?.status || '',
            startTime: response.data?.startTime || '',
            endTime: response.data?.endTime || '',
            expectedAttendees: response.data?.expectedAttendees,
            resourceId: response.data?.resourceId || '',
          });
        }
      } catch (requestError) {
        if (!cancelled) {
          setRelatedDetails(null);
          setRelatedError('Could not load detailed message for this notification.');
        }
      } finally {
        if (!cancelled) {
          setRelatedLoading(false);
        }
      }
    };

    loadRelatedDetails();

    return () => {
      cancelled = true;
    };
  }, [selectedNotification]);

  const handleSelectNotification = async (item) => {
    setSelectedId(item.id);

    if (item.read) {
      return;
    }

    try {
      await api.put(`/notifications/${item.id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    } catch (requestError) {
      setError('Could not mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!notifications.some((n) => !n.read)) {
      return;
    }

    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (requestError) {
      setError('Could not mark all as read');
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedNotification) {
      return;
    }

    const deletingId = selectedNotification.id;
    if (!deletingId) {
      return;
    }

    setError('');
    setNotifications((prev) => prev.filter((n) => n.id !== deletingId));
    setSelectedId('');

    try {
      await api.delete(`/notifications/${deletingId}`);
    } catch (requestError) {
      // Best-effort delete: keep UI clean even if backend item is already gone.
    }
  };

  const handleNavigate = () => {
    if (!selectedNotification) {
      return;
    }

    const kind = getNotificationKind(selectedNotification.type);
    if ((kind === 'TICKET' || kind === 'COMMENT') && (!relatedDetails || relatedError)) {
      setRelatedError('Related ticket is unavailable for navigation.');
      return;
    }

    const path = getNavigatePath(selectedNotification);
    if (path) {
      navigate(path);
    }
  };

  const canNavigate = !!getNavigatePath(selectedNotification) && !relatedLoading && (
    getNotificationKind(selectedNotification?.type) === 'BOOKING' ||
    (!!relatedDetails && !relatedError)
  );

  const filters = [
    { key: 'ALL', label: 'All' },
    { key: 'BOOKINGS', label: 'Bookings' },
    { key: 'TICKETS', label: 'Tickets' },
    { key: 'COMMENTS', label: 'Comments' },
  ];

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 100px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#475569',
        fontWeight: 600,
      }}>
        Loading notifications...
      </div>
    );
  }

  return (
    <section style={{
      minHeight: 'calc(100vh - 80px)',
      background: '#f8fafc',
      padding: '24px 16px 40px',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            marginBottom: '12px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>

        {error && (
          <div style={{
            marginBottom: '12px',
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#991b1b',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '35% 65%',
          gap: '14px',
          minHeight: '72vh',
        }}>
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            background: '#ffffff',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Notifications</h2>
                <span style={{
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '2px 9px',
                }}>
                  {unreadCount}
                </span>
              </div>

              <button
                type="button"
                onClick={handleMarkAllAsRead}
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  padding: '6px 9px',
                  cursor: 'pointer',
                }}
              >
                Mark all as read
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '12px 12px 10px',
              borderBottom: '1px solid #f1f5f9',
              flexWrap: 'wrap',
            }}>
              {filters.map((filter) => {
                const isActive = activeFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    style={{
                      border: isActive ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      background: isActive ? '#f8fbff' : '#ffffff',
                      color: isActive ? '#1d4ed8' : '#475569',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      padding: '6px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {!filteredNotifications.length ? (
                <div style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontWeight: 600,
                  padding: '20px',
                  textAlign: 'center',
                }}>
                  No notifications yet
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const selected = item.id === selectedId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectNotification(item)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: 'none',
                        borderBottom: '1px solid #f1f5f9',
                        borderLeft: item.read ? '3px solid transparent' : '3px solid #2563eb',
                        background: selected ? '#f8fbff' : item.read ? '#fbfdff' : '#ffffff',
                        cursor: 'pointer',
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', minWidth: 0 }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '999px',
                            marginTop: '7px',
                            flexShrink: 0,
                            background: getNotificationKind(item.type) === 'BOOKING'
                              ? '#0ea5e9'
                              : getNotificationKind(item.type) === 'TICKET' || getNotificationKind(item.type) === 'COMMENT'
                                ? '#2563eb'
                                : '#64748b',
                          }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{
                              color: '#0f172a',
                              fontWeight: item.read ? 600 : 800,
                              fontSize: '0.9rem',
                              marginBottom: '2px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {item.title}
                            </div>
                            <div style={{
                              color: '#475569',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              marginBottom: '3px',
                              letterSpacing: '0.04em',
                            }}>
                              {typeLabel(item.type)}
                            </div>
                            <div style={{
                              color: '#64748b',
                              fontSize: '0.82rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {truncate(item.message, 60)}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          color: '#64748b',
                          fontSize: '0.72rem',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}>
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            background: '#ffffff',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {!selectedNotification ? (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                fontWeight: 600,
                textAlign: 'center',
              }}>
                Select a notification to view details
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {typeLabel(selectedNotification.type)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getNavigatePath(selectedNotification) && (
                      <button
                        type="button"
                        onClick={handleNavigate}
                        disabled={!canNavigate}
                        style={{
                          border: '1px solid #cbd5e1',
                          background: canNavigate ? '#ffffff' : '#f8fafc',
                          color: canNavigate ? '#1d4ed8' : '#94a3b8',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          padding: '7px 12px',
                          cursor: canNavigate ? 'pointer' : 'not-allowed',
                          opacity: canNavigate ? 1 : 0.9,
                        }}
                      >
                        Navigate
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      style={{
                        border: '1px solid #fecaca',
                        background: '#fff7f7',
                        color: '#b91c1c',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        padding: '7px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <h3 style={{
                  margin: '14px 0 10px 0',
                  color: '#0f172a',
                  fontSize: '1.28rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}>
                  {selectedNotification.title}
                </h3>

                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  background: '#fcfdff',
                }}>
                  <div style={{
                    color: '#334155',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Detailed Message
                  </div>

                  {relatedLoading ? (
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>
                      Loading related details...
                    </p>
                  ) : (
                    <p style={{
                      margin: 0,
                      color: '#334155',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {relatedDetails?.message || selectedNotification.message}
                    </p>
                  )}

                  {relatedError && (
                    <p style={{ margin: '8px 0 0', color: '#b45309', fontSize: '0.82rem' }}>
                      {relatedError}
                    </p>
                  )}
                </div>

                <div style={{
                  marginTop: '16px',
                  color: '#334155',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  display: 'grid',
                  gap: '6px',
                }}>
                  {relatedDetails?.kind === 'TICKET' && relatedDetails.resourceLocation && (
                    <div><strong>Location:</strong> {relatedDetails.resourceLocation}</div>
                  )}
                  {relatedDetails?.kind === 'TICKET' && relatedDetails.category && (
                    <div><strong>Category:</strong> {relatedDetails.category.replaceAll('_', ' ')}</div>
                  )}
                  {relatedDetails?.kind === 'BOOKING' && relatedDetails.resourceId && (
                    <div><strong>Resource:</strong> {relatedDetails.resourceId}</div>
                  )}
                  {relatedDetails?.kind === 'BOOKING' && relatedDetails.startTime && (
                    <div><strong>Start:</strong> {new Date(relatedDetails.startTime).toLocaleString()}</div>
                  )}
                  {relatedDetails?.kind === 'BOOKING' && relatedDetails.endTime && (
                    <div><strong>End:</strong> {new Date(relatedDetails.endTime).toLocaleString()}</div>
                  )}
                  {relatedDetails?.kind === 'BOOKING' && Number.isInteger(relatedDetails.expectedAttendees) && (
                    <div><strong>Expected Attendees:</strong> {relatedDetails.expectedAttendees}</div>
                  )}
                  {relatedDetails?.status && (
                    <div><strong>Status:</strong> {relatedDetails.status.replaceAll('_', ' ')}</div>
                  )}
                </div>

                <div style={{
                  marginTop: '18px',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '14px',
                  color: '#64748b',
                  fontSize: '0.88rem',
                  display: 'grid',
                  gap: '8px',
                }}>
                  <div>
                    <strong style={{ color: '#334155' }}>Timestamp:</strong>{' '}
                    {selectedNotification.createdAt
                      ? new Date(selectedNotification.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </div>
                  {selectedNotification.referenceId && (
                    <div>
                      <strong style={{ color: '#334155' }}>Related ID:</strong> {selectedNotification.referenceId}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotificationsPage;
