import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, AlertCircle, CheckCircle, Send, Tag, MapPin, User, Phone, Mail, Wrench } from 'lucide-react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  OPEN:        { color: '#1E3A8A', background: '#DBEAFE', border: '1px solid #BFDBFE' },
  IN_PROGRESS: { color: '#92400E', background: '#FEF3C7', border: '1px solid #FDE68A' },
  RESOLVED:    { color: '#065F46', background: '#D1FAE5', border: '1px solid #A7F3D0' },
  REJECTED:    { color: '#991B1B', background: '#FEE2E2', border: '1px solid #FECACA' },
  CLOSED:      { color: '#374151', background: '#F3F4F6', border: '1px solid #E5E7EB' },
};

const TicketDetail = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [ticket, setTicket]                   = useState(null);
  const [error, setError]                     = useState(null);
  const [commentText, setCommentText]         = useState('');
  const [comments, setComments]               = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({ status: '', notes: '' });
  const [isUpdating, setIsUpdating]           = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await API.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket.');
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) fetchTicket();
      else setError('You must be logged in to view this ticket.');
    }
  }, [id, authLoading, user]);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      await API.patch(`/tickets/${id}/status`, {
        status: statusUpdateData.status,
        resolutionNotes: statusUpdateData.status === 'RESOLVED' ? statusUpdateData.notes : null,
        rejectionReason: statusUpdateData.status === 'REJECTED' ? statusUpdateData.notes : null,
        assignedTechnician: statusUpdateData.status === 'IN_PROGRESS' ? (user?.name || 'Current User') : null,
      });
      setShowStatusModal(false);
      fetchTicket();
    } catch {
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
    } catch { alert('Failed to close ticket.'); }
    finally { setIsUpdating(false); }
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(), author: user?.name || 'You',
      text: commentText.trim(), createdAt: new Date().toISOString(),
    }]);
    setCommentText('');
  };

  if (authLoading) return (
    <div style={{ padding: '80px', textAlign: 'center', color: '#6B7280' }}>Checking authentication…</div>
  );

  if (error) return (
    <div style={{ padding: '80px', textAlign: 'center' }}>
      <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px' }} />
      <p style={{ color: '#DC2626', fontWeight: 600, fontSize: '1.1rem' }}>⚠️ {error}</p>
      <Link to="/tickets">
        <button style={{
          marginTop: '16px', padding: '10px 20px', background: '#FFFFFF',
          border: '1.5px solid #1E3A8A', color: '#1E3A8A', borderRadius: '8px',
          fontWeight: 600, cursor: 'pointer',
        }}>← Back to Tickets</button>
      </Link>
    </div>
  );

  if (!ticket) return (
    <div style={{ padding: '80px', textAlign: 'center', color: '#6B7280' }}>Loading Ticket…</div>
  );

  const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.CLOSED;
  const canManage = user?.role === 'ADMIN' || (user?.role === 'TECHNICIAN' && user?.id === ticket.assignedTechnicianId);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/tickets">
            <button style={{
              padding: '9px 12px', background: '#FFFFFF',
              border: '1.5px solid #E5E7EB', borderRadius: '8px',
              display: 'flex', alignItems: 'center', color: '#1E3A8A',
              cursor: 'pointer', transition: 'all 0.18s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1E3A8A'; e.currentTarget.style.background = '#EFF6FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              ...statusStyle, padding: '5px 12px', borderRadius: '999px',
              fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.03em',
            }}>
              {ticket.status.replace('_', ' ')}
            </span>
            <h2 style={{
              margin: 0, fontSize: '1.6rem', fontWeight: 700,
              color: '#1E3A8A', fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em',
            }}>
              Ticket #{ticket.id.slice(-5)}
            </h2>
          </div>
        </div>

        {canManage && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {ticket.status === 'OPEN' && (
              <button disabled={isUpdating} onClick={() => { setStatusUpdateData({ status: 'IN_PROGRESS', notes: '' }); setShowStatusModal(true); }}
                style={{
                  padding: '10px 20px', background: '#1E3A8A', color: '#FFFFFF',
                  border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,58,138,0.3)',
                }}>
                Accept &amp; Start
              </button>
            )}
            {ticket.status === 'IN_PROGRESS' && (<>
              <button disabled={isUpdating} onClick={() => { setStatusUpdateData({ status: 'RESOLVED', notes: '' }); setShowStatusModal(true); }}
                style={{
                  padding: '10px 20px', background: '#16A34A', color: '#FFFFFF',
                  border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                }}>
                Mark Resolved
              </button>
              <button disabled={isUpdating} onClick={() => { setStatusUpdateData({ status: 'REJECTED', notes: '' }); setShowStatusModal(true); }}
                style={{
                  padding: '10px 20px', background: '#FFFFFF', color: '#DC2626',
                  border: '1.5px solid #DC2626', borderRadius: '8px',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}>
                Reject
              </button>
            </>)}
            {(ticket.status === 'RESOLVED' || ticket.status === 'REJECTED') && (
              <button disabled={isUpdating} onClick={handleCloseTicket}
                style={{
                  padding: '10px 20px', background: '#FFFFFF', color: '#374151',
                  border: '1.5px solid #E5E7EB', borderRadius: '8px',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}>
                {isUpdating ? 'Closing…' : 'Close Ticket'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Body Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '28px' }}>

        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Description Card */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E5E7EB',
            borderRadius: '12px', padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <h3 style={{
              margin: '0 0 20px 0', fontSize: '1.05rem', fontWeight: 700,
              color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertCircle size={17} color="#1E3A8A" />
              </div>
              Issue Description
            </h3>
            <div style={{
              lineHeight: '1.75', color: '#374151',
              background: '#F8FAFC', border: '1px solid #E5E7EB',
              padding: '20px', borderRadius: '10px', fontSize: '0.95rem',
              borderLeft: '3px solid #1E3A8A',
            }}>
              {ticket.description}
            </div>

            {ticket.rejectionReason && (
              <div style={{
                marginTop: '20px', padding: '18px 20px',
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderLeft: '3px solid #DC2626', borderRadius: '10px',
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#991B1B', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} /> Rejection Reason
                </h4>
                <p style={{ margin: 0, color: '#7F1D1D', fontSize: '0.9rem', lineHeight: '1.6' }}>{ticket.rejectionReason}</p>
              </div>
            )}

            {ticket.resolutionNotes && (
              <div style={{
                marginTop: '20px', padding: '18px 20px',
                background: '#F0FDF4', border: '1px solid #A7F3D0',
                borderLeft: '3px solid #16A34A', borderRadius: '10px',
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#15803D', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={15} /> Resolution Notes
                </h4>
                <p style={{ margin: 0, color: '#14532D', fontSize: '0.9rem', lineHeight: '1.6' }}>{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* Discussion Card */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E5E7EB',
            borderRadius: '12px', padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <h3 style={{
              margin: '0 0 20px 0', fontSize: '1.05rem', fontWeight: 700,
              color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MessageSquare size={17} color="#1E3A8A" />
              </div>
              Discussion Thread
            </h3>

            {comments.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                color: '#9CA3AF', background: '#F9FAFB',
                borderRadius: '10px', border: '1px dashed #E5E7EB',
                fontSize: '0.9rem',
              }}>
                No comments yet. Start the discussion below.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {comments.map(c => (
                  <div key={c.id} style={{
                    padding: '14px 18px', background: '#F8FAFC',
                    borderRadius: '10px', border: '1px solid #E5E7EB',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E3A8A' }}>{c.author}</span>
                      <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ margin: 0, color: '#374151', lineHeight: '1.6', fontSize: '0.9rem' }}>{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handlePostComment} style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <input
                style={{
                  flex: 1, padding: '10px 16px',
                  border: '1.5px solid #E5E7EB', borderRadius: '8px',
                  fontSize: '0.875rem', color: '#1F2937', background: '#FFFFFF',
                  outline: 'none', fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.18s ease',
                }}
                placeholder="Write a comment…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = '#1E3A8A'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
              />
              <button type="submit" style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 18px', background: '#1E3A8A', color: '#FFFFFF',
                border: 'none', borderRadius: '8px', fontWeight: 600,
                fontSize: '0.875rem', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(30,58,138,0.25)',
                transition: 'background 0.18s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#162d6e'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E3A8A'; }}
              >
                <Send size={15} /> Post
              </button>
            </form>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Ticket Details Card */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E5E7EB',
            borderRadius: '12px', overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            {/* Card header */}
            <div style={{
              padding: '16px 20px', background: '#1E3A8A',
              borderBottom: '1px solid #162d6e',
            }}>
              <h4 style={{
                margin: 0, color: '#FFFFFF', fontSize: '0.85rem',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Ticket Details
              </h4>
            </div>

            <div style={{ padding: '20px' }}>
              {[
                { label: 'PRIORITY', icon: <Tag size={13} color="#3B82F6" />, content: (
                  <span style={{
                    padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700,
                    color: ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? '#991B1B' : ticket.priority === 'LOW' ? '#065F46' : '#92400E',
                    background: ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? '#FEE2E2' : ticket.priority === 'LOW' ? '#D1FAE5' : '#FEF3C7',
                  }}>
                    {ticket.priority}
                  </span>
                )},
                { label: 'CATEGORY', icon: <Tag size={13} color="#3B82F6" />, content: ticket.category?.replace('_', ' ') || '—' },
                { label: 'LOCATION', icon: <MapPin size={13} color="#3B82F6" />, content: ticket.resourceLocation || '—' },
                { label: 'TECHNICIAN', icon: <Wrench size={13} color="#3B82F6" />, content: ticket.assignedTechnician || (
                  <span style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.85rem' }}>Unassigned</span>
                )},
                { label: 'REPORTED BY', icon: <User size={13} color="#3B82F6" />, content: ticket.contactName },
                { label: 'EMAIL', icon: <Mail size={13} color="#3B82F6" />, content: ticket.contactEmail || '—' },
                { label: 'PHONE', icon: <Phone size={13} color="#3B82F6" />, content: ticket.contactPhone || '—' },
              ].map(({ label, icon, content }, i, arr) => (
                <div key={label} style={{
                  paddingBottom: i < arr.length - 1 ? '16px' : 0,
                  marginBottom: i < arr.length - 1 ? '16px' : 0,
                  borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF',
                    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {icon} {label}
                  </span>
                  {typeof content === 'string'
                    ? <span style={{ color: '#1F2937', fontWeight: 600, fontSize: '0.9rem' }}>{content}</span>
                    : content}
                </div>
              ))}
            </div>
          </div>

          {/* Attached Images */}
          {ticket.imageUrls && ticket.imageUrls.length > 0 && (
            <div style={{
              background: '#FFFFFF', border: '1px solid #E5E7EB',
              borderRadius: '12px', padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <h4 style={{
                margin: '0 0 14px 0', color: '#1E3A8A', fontSize: '0.85rem',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Attached Images
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {ticket.imageUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Attachment ${i + 1}`} style={{
                      width: '100%', borderRadius: '8px', objectFit: 'cover',
                      aspectRatio: '1', border: '1px solid #E5E7EB',
                      transition: 'opacity 0.18s ease',
                    }} />
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
          background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            width: '100%', maxWidth: '460px', background: '#FFFFFF',
            borderRadius: '14px', padding: '32px', position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            border: '1px solid #E5E7EB',
          }}>
            {/* Modal top accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: statusUpdateData.status === 'RESOLVED' ? '#16A34A'
                : statusUpdateData.status === 'REJECTED' ? '#DC2626' : '#1E3A8A',
              borderRadius: '14px 14px 0 0',
            }} />

            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 700, color: '#1E3A8A' }}>
              Update Ticket Status
            </h3>
            <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {statusUpdateData.status === 'RESOLVED'
                ? 'Please provide details on how the issue was resolved.'
                : statusUpdateData.status === 'REJECTED'
                ? 'Please explain why this request is being rejected.'
                : 'Confirm you are taking responsibility for this ticket.'}
            </p>

            {(statusUpdateData.status === 'RESOLVED' || statusUpdateData.status === 'REJECTED') && (
              <textarea
                placeholder="Enter notes here…"
                rows="4"
                value={statusUpdateData.notes}
                onChange={e => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
                style={{
                  width: '100%', resize: 'vertical', boxSizing: 'border-box',
                  padding: '12px 16px', border: '1.5px solid #E5E7EB', borderRadius: '8px',
                  fontSize: '0.875rem', color: '#1F2937', fontFamily: 'Inter, sans-serif',
                  outline: 'none', lineHeight: '1.6',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#1E3A8A'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button disabled={isUpdating} onClick={() => setShowStatusModal(false)}
                style={{
                  padding: '10px 20px', background: '#FFFFFF', color: '#374151',
                  border: '1.5px solid #E5E7EB', borderRadius: '8px',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button disabled={isUpdating} onClick={handleStatusUpdate}
                style={{
                  padding: '10px 20px', fontWeight: 600, fontSize: '0.875rem',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#FFFFFF',
                  background: statusUpdateData.status === 'RESOLVED' ? '#16A34A'
                    : statusUpdateData.status === 'REJECTED' ? '#DC2626' : '#1E3A8A',
                  boxShadow: '0 4px 12px rgba(30,58,138,0.25)',
                }}>
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