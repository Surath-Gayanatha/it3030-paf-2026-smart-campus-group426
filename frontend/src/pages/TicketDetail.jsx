import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, AlertCircle, CheckCircle, Send } from 'lucide-react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';

const TicketDetail = ({ isAdmin = false }) => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({ status: '', notes: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await API.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load ticket.');
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchTicket();
      } else {
        setError('You must be logged in to view this ticket.');
      }
    }
  }, [id, authLoading, user]);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      const payload = {
        status: statusUpdateData.status,
        resolutionNotes: statusUpdateData.status === 'RESOLVED' ? statusUpdateData.notes : null,
        rejectionReason: statusUpdateData.status === 'REJECTED' ? statusUpdateData.notes : null,
        assignedTechnician: statusUpdateData.status === 'IN_PROGRESS' ? (user?.name || 'Current User') : null,
      };
      await API.patch(`/tickets/${id}/status`, payload);
      setShowStatusModal(false);
      fetchTicket();
    } catch (err) {
      console.error(err);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseTicket = async () => {
    setIsUpdating(true);
    try {
      await API.patch(`/tickets/${id}/status`, { status: 'CLOSED' });
      fetchTicket();
    } catch (err) {
      alert('Failed to close ticket.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    // Optimistic UI — push comment locally
    setComments(prev => [...prev, {
      id: Date.now(),
      author: user?.name || 'You',
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    }]);
    setCommentText('');
    // TODO: wire up to API.post(`/tickets/${id}/comments`, { text }) when ready
  };

  // ── Loading / Error states ────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Checking authentication…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
        <p style={{ color: '#EF4444', fontWeight: 600, fontSize: '1.1rem' }}>⚠️ {error}</p>
        <Link to="/tickets">
          <button className="secondary-btn" style={{ marginTop: '16px' }}>← Back to Tickets</button>
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading Ticket…
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/tickets">
            <button className="secondary-btn" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`status-chip status-${ticket.status}`}>{ticket.status.replace('_', ' ')}</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Ticket #{ticket.id.slice(-5)}</h2>
          </div>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {ticket.status === 'OPEN' && (
              <button
                className="premium-btn"
                disabled={isUpdating}
                onClick={() => { setStatusUpdateData({ status: 'IN_PROGRESS', notes: '' }); setShowStatusModal(true); }}
              >
                Accept &amp; Start
              </button>
            )}
            {ticket.status === 'IN_PROGRESS' && (
              <>
                <button
                  className="premium-btn"
                  disabled={isUpdating}
                  onClick={() => { setStatusUpdateData({ status: 'RESOLVED', notes: '' }); setShowStatusModal(true); }}
                >
                  Mark Resolved
                </button>
                <button
                  className="secondary-btn"
                  disabled={isUpdating}
                  style={{ color: '#EF4444' }}
                  onClick={() => { setStatusUpdateData({ status: 'REJECTED', notes: '' }); setShowStatusModal(true); }}
                >
                  Reject
                </button>
              </>
            )}
            {(ticket.status === 'RESOLVED' || ticket.status === 'REJECTED') && (
              <button className="secondary-btn" disabled={isUpdating} onClick={handleCloseTicket}>
                {isUpdating ? 'Closing…' : 'Close Ticket'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '32px' }}>

        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Description */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={22} color="var(--primary-accent)" />
              Issue Description
            </h3>
            <div style={{
              lineHeight: '1.7',
              color: 'var(--text-primary)',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '24px',
              borderRadius: '12px',
              fontSize: '1.05rem'
            }}>
              {ticket.description}
            </div>

            {ticket.rejectionReason && (
              <div style={{ marginTop: '24px', padding: '20px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#B91C1C', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} /> Rejection Reason
                </h4>
                <p style={{ margin: 0, color: '#991B1B', fontSize: '0.95rem' }}>{ticket.rejectionReason}</p>
              </div>
            )}

            {ticket.resolutionNotes && (
              <div style={{ marginTop: '24px', padding: '20px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#15803D', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> Resolution Notes
                </h4>
                <p style={{ margin: 0, color: '#166534', fontSize: '0.95rem' }}>{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* Discussion */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageSquare size={22} color="var(--secondary-accent)" />
              Discussion Thread
            </h3>

            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', background: '#F8FAFC', borderRadius: '12px' }}>
                No comments yet. Start the discussion below.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {comments.map(c => (
                  <div key={c.id} style={{ padding: '16px 20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-accent)' }}>{c.author}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.6' }}>{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handlePostComment} style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <input
                className="premium-input"
                style={{ flex: 1, marginBottom: 0 }}
                placeholder="Write a comment…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button className="premium-btn" type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={16} /> Post
              </button>
            </form>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Ticket Meta */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h4 style={{ margin: '0 0 20px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ticket Details
            </h4>

            {[
              { label: 'PRIORITY', content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="priority-indicator" style={{ background: `var(--priority-${ticket.priority.toLowerCase()})` }} />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{ticket.priority}</span>
                </div>
              )},
              { label: 'CATEGORY', content: ticket.category },
              { label: 'LOCATION', content: ticket.resourceLocation || '—' },
              { label: 'ASSIGNED TECHNICIAN', content: ticket.assignedTechnician || 'Unassigned' },
              { label: 'REPORTED BY', content: ticket.contactName },
              { label: 'CONTACT EMAIL', content: ticket.contactEmail || '—' },
              { label: 'CONTACT PHONE', content: ticket.contactPhone || '—' },
            ].map(({ label, content }) => (
              <div key={label} style={{ marginBottom: '20px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                  {label}
                </span>
                {typeof content === 'string'
                  ? <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{content}</span>
                  : content}
              </div>
            ))}
          </div>

          {/* Attached Images */}
          {ticket.imageUrls && ticket.imageUrls.length > 0 && (
            <div className="glass-panel" style={{ padding: '28px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Attached Images
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {ticket.imageUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt={`Attachment ${i + 1}`}
                      style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', aspectRatio: '1', border: '1px solid #E2E8F0' }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status Update Modal ── */}
      {showStatusModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '450px', padding: '32px', background: '#FFF' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Update Ticket Status</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {statusUpdateData.status === 'RESOLVED'
                ? 'Please provide details on how the issue was resolved.'
                : statusUpdateData.status === 'REJECTED'
                ? 'Please explain why this request is being rejected.'
                : 'Confirm you are taking responsibility for this ticket.'}
            </p>

            {(statusUpdateData.status === 'RESOLVED' || statusUpdateData.status === 'REJECTED') && (
              <textarea
                className="premium-input"
                placeholder="Enter notes here…"
                rows="4"
                value={statusUpdateData.notes}
                onChange={e => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
                style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box' }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="secondary-btn" disabled={isUpdating} onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
              <button className="premium-btn" disabled={isUpdating} onClick={handleStatusUpdate}>
                {isUpdating ? 'Updating…' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;