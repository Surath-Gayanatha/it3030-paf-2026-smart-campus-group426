import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const getTimeAgo = (value) => {
  if (!value) {
    return 'Just now';
  }

  const created = new Date(value);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (diffSeconds < 60) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const getNotificationKind = (type) => {
  if (type?.includes('BOOKING')) return 'BOOKING';
  if (type?.includes('TICKET')) return 'TICKET';
  if (type === 'NEW_COMMENT') return 'COMMENT';
  return 'GENERAL';
};

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');
  const panelRef = useRef(null);

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.read),
    [notifications]
  );

  const fetchNotifications = async () => {
    if (!user) {
      return;
    }

    try {
      setError('');
      const [notificationsResponse, unreadResponse] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);

      setNotifications(notificationsResponse.data || []);
      setUnreadCount(unreadResponse.data?.count || 0);
    } catch (requestError) {
      setError('Failed to load notifications');
    }
  };

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (requestError) {
      setError('Could not mark notification as read');
    }
  };

  const handleNotificationClick = async (item) => {
    if (!item.read) {
      handleMarkAsRead(item.id);
    }

    const kind = getNotificationKind(item.type);
    if (kind === 'BOOKING') {
      navigate('/bookings');
      setOpen(false);
      return;
    }

    // Ticket/comment IDs may reference deleted items, so route via Notifications page.
    navigate('/notifications');
    setOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!unreadNotifications.length) {
      return;
    }

    try {
      setLoading(true);
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (requestError) {
      setError('Could not mark all notifications as read');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const deletingId = id;
    if (!deletingId) {
      return;
    }

    setError('');
    const target = notifications.find((item) => item.id === deletingId);
    setNotifications((prev) => prev.filter((item) => item.id !== deletingId));
    if (target && !target.read) {
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    }

    try {
      await api.delete(`/notifications/${deletingId}`);
    } catch (requestError) {
      // Best-effort delete: keep UI clean even if backend item is already gone.
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="notification" ref={panelRef}>
      <button
        className="notification__trigger"
        aria-label="Open notifications"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className="notification__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notification__panel">
          <div className="notification__header">
            <h4>Notifications</h4>
            <button
              className="notification__action"
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={loading || unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>

          {error && <p className="notification__error">{error}</p>}

          {notifications.length === 0 ? (
            <div className="notification__empty">No notifications yet</div>
          ) : (
            <ul className="notification__list">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className={`notification__item${item.read ? '' : ' notification__item--unread'}`}
                >
                  <button
                    type="button"
                    className="notification__content"
                    onClick={() => handleNotificationClick(item)}
                  >
                    <p className="notification__title">{item.title}</p>
                    <p className="notification__message">{item.message}</p>
                    <span className="notification__time">{getTimeAgo(item.createdAt)}</span>
                  </button>

                  <button
                    type="button"
                    className="notification__delete"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete notification"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="notification__footer">
            <button
              type="button"
              className="notification__footer-link"
              onClick={() => { navigate('/notifications'); setOpen(false); }}
            >
              View all notifications →
            </button>
            <button
              type="button"
              className="notification__footer-subtle"
              onClick={() => { navigate('/notifications/preferences'); setOpen(false); }}
            >
              {user?.role === 'ADMIN' ? '⚙ Ticket Notification Preference' : '⚙ Notification Preferences'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
