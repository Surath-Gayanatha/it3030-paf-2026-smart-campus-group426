import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, AlertCircle, CheckCircle, Send, Tag, MapPin, User, Phone, Mail, Wrench, Check, X, FilePlus, Archive, Shield, Info, Calendar, Hash, UserCog, TrendingUp, Trash2, AlertTriangle } from 'lucide-react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  OPEN:        { color: '#1E3A8A', background: '#DBEAFE', border: '1px solid #BFDBFE' },
  IN_PROGRESS: { color: '#92400E', background: '#FEF3C7', border: '1px solid #FDE68A' },
  RESOLVED:    { color: '#065F46', background: '#D1FAE5', border: '1px solid #A7F3D0' },
  REJECTED:    { color: '#991B1B', background: '#FEE2E2', border: '1px solid #FECACA' },
  CLOSED:      { color: '#374151', background: '#F3F4F6', border: '1px solid #E5E7EB' },
};

const TicketProgressBar = ({ status }) => {
  const isRejected = status === 'REJECTED';
  const steps = [
    { id: 'OPEN', label: 'Submitted', icon: FilePlus },
    { id: 'IN_PROGRESS', label: isRejected ? 'Rejected' : 'In Progress', icon: isRejected ? X : Wrench },
    { id: 'RESOLVED', label: 'Resolved', icon: CheckCircle },
    { id: 'CLOSED', label: 'Closed', icon: Archive }
  ];

  let currentStepIndex = 0;
  if (status === 'IN_PROGRESS') currentStepIndex = 1;
  if (status === 'RESOLVED') currentStepIndex = 2;
  if (status === 'CLOSED') currentStepIndex = 3;
  if (isRejected) currentStepIndex = 1;

  return (
    <div style={{ width: '100%', marginBottom: '40px', padding: '0 20px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto'
      }}>
        {/* Background Track */}
        <div style={{
          position: 'absolute', top: '16px', left: '8%', right: '8%',
          height: '4px', background: '#E5E7EB', zIndex: 0, borderRadius: '4px'
        }} />

        {/* Active Fill */}
        <div style={{
          position: 'absolute', top: '16px', left: '8%',
          height: '4px', zIndex: 1, borderRadius: '4px',
          background: isRejected ? '#DC2626' : '#1E3A8A',
          width: currentStepIndex === 0 ? '0%' : currentStepIndex === 1 ? '28%' : currentStepIndex === 2 ? '56%' : '84%',
          transition: 'width 0.5s ease-in-out, background 0.5s ease-in-out',
        }} />

        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex && !isRejected;
          const isStepRejected = isRejected && index === 1;

          let bgColor = '#FFFFFF';
          let borderColor = '#E5E7EB';
          let color = '#9CA3AF';

          if (isActive && !isRejected) {
            bgColor = '#1E3A8A'; borderColor = '#1E3A8A'; color = '#FFFFFF';
          } else if (isRejected) {
            if (index === 0) {
              bgColor = '#10B981'; borderColor = '#10B981'; color = '#FFFFFF';
            } else if (index === 1) {
              bgColor = '#DC2626'; borderColor = '#DC2626'; color = '#FFFFFF';
            }
          }

          const StepIcon = step.icon;

          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '10px', width: '80px' }}>
              <div 
                className={isCurrent ? 'status-pulse shadow-glow' : ''}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: bgColor, border: `2.5px solid ${borderColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: color, 
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isCurrent ? `0 0 20px ${borderColor}44` : isStepRejected ? '0 0 0 5px rgba(220,38,38,0.1)' : 'none',
                }}
              >
                <StepIcon size={18} strokeWidth={isActive ? 3 : 2} />
              </div>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700,
                color: isActive ? '#1F2937' : '#9CA3AF',
                textAlign: 'center', width: 'max-content',
                textTransform: 'uppercase', letterSpacing: '0.025em'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TicketDetail = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [ticket, setTicket]                   = useState(null);
  const [error, setError]                     = useState(null);
  const [commentText, setCommentText]         = useState('');
  const [comments, setComments]               = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({ status: '', notes: '' });
  const [isUpdating, setIsUpdating]           = useState(false);
  const navigate = useNavigate();

  const fetchTicket = async () => {
    try {
      const res = await API.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket.');
    }
  };

  const fetchComments = async () => {
    try {
      const res = await API.get(`/tickets/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchTicket();
        fetchComments();
      }
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

  const handleDeleteTicket = async () => {
    setIsUpdating(true);
    try {
      await API.delete(`/tickets/${id}`);
      navigate('/tickets');
    } catch {
      alert('Failed to delete ticket. Perhaps you lack permission?');
    } finally {
      setIsUpdating(false);
      setShowDeleteModal(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await API.post(`/tickets/${id}/comments`, { text: commentText.trim() });
      setCommentText('');
      fetchComments();
    } catch {
      alert('Failed to post comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await API.delete(`/tickets/comments/${commentId}`);
      fetchComments();
    } catch {
      alert('Failed to delete comment.');
    }
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

            {(user?.role === 'ADMIN' || (ticket.createdBy === user?.email && ticket.status === 'OPEN')) && (
              <button 
                onClick={() => setShowDeleteModal(true)}
                title="Delete Ticket"
                className="hover-lift"
                style={{
                  padding: '8px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)',
                  color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: '8px', transition: 'all 0.2s'
                }}
              >
                <Trash2 size={18} />
              </button>
            )}
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

      {/* ── Progress Tracker ── */}
      <TicketProgressBar status={ticket.status} />

      {/* ── Body Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.15fr', gap: '32px' }}>

        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Description Card */}
          <div className="glass-card animate-slide-up" style={{
            borderRadius: '20px', padding: '36px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{
              margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 800,
              color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '12px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(59,130,246,0.1)'
              }}>
                <Info size={19} color="#1E3A8A" />
              </div>
              Issue Summary
            </h3>
            
            <div style={{
              lineHeight: '1.8', color: '#334155',
              background: '#FFFFFF', border: '1px solid #F1F5F9',
              padding: '24px', borderRadius: '16px', fontSize: '1.05rem',
              borderLeft: '4px solid #1E3A8A',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}>
              {ticket.description}
            </div>

            {ticket.rejectionReason && (
              <div className="animate-fade-in" style={{
                marginTop: '24px', padding: '24px',
                background: '#FEF2F2', border: '1px solid #FEE2E2',
                borderLeft: '4px solid #DC2626', borderRadius: '16px',
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#991B1B', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <AlertCircle size={17} /> Management Feedback
                </h4>
                <p style={{ margin: 0, color: '#7F1D1D', fontSize: '1rem', lineHeight: '1.7' }}>{ticket.rejectionReason}</p>
              </div>
            )}

            {ticket.resolutionNotes && (
              <div className="animate-fade-in" style={{
                marginTop: '24px', padding: '24px',
                background: '#F0FDF4', border: '1px solid #DCFCE7',
                borderLeft: '4px solid #16A34A', borderRadius: '16px',
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#15803D', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <CheckCircle size={17} /> Resolution Report
                </h4>
                <p style={{ margin: 0, color: '#14532D', fontSize: '1rem', lineHeight: '1.7' }}>{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* Discussion Card */}
          <div className="glass-card animate-slide-up" style={{
            borderRadius: '20px', padding: '36px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
            animationDelay: '0.1s'
          }}>
            <h3 style={{
              margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 800,
              color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '12px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(59,130,246,0.1)'
              }}>
                <MessageSquare size={19} color="#1E3A8A" />
              </div>
              Discussion Thread
            </h3>

            {comments.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                color: '#94A3B8', background: '#F8FAFC',
                borderRadius: '16px', border: '2px dashed #E2E8F0',
                fontSize: '0.95rem',
              }}>
                No messages yet. Be the first to start the sync.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
                {comments.map(c => {
                  const initial = c.authorName?.charAt(0).toUpperCase() || '?';
                  const isAuthor = user?.email === c.authorEmail;
                  const isAdmin = user?.role === 'ADMIN';

                  return (
                    <div key={c.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      {c.authorAvatar ? (
                        <img src={c.authorAvatar} alt={c.authorName} style={{
                          width: '40px', height: '40px', borderRadius: '12px',
                          objectFit: 'cover', flexShrink: 0,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }} />
                      ) : (
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '12px',
                          background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
                          boxShadow: '0 4px 10px rgba(30,58,138,0.15)'
                        }}>
                          {initial}
                        </div>
                      )}
                      <div className="animate-fade-in" style={{
                        flex: 1, padding: '18px 24px', background: isAuthor ? '#F0F9FF' : '#F1F5F9',
                        borderRadius: isAuthor ? '20px 0 20px 20px' : '0 20px 20px 20px', 
                        position: 'relative', border: isAuthor ? '1px solid #BAE6FD' : '1px solid #E2E8F0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1E3A8A' }}>
                            {c.authorName} {isAuthor && <span style={{ fontWeight: 500, color: '#0369A1', fontSize: '0.75rem' }}>(You)</span>}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
                              {new Date(c.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                            {(isAuthor || isAdmin) && (
                              <button 
                                onClick={() => handleDeleteComment(c.id)}
                                style={{
                                  background: 'none', border: 'none', padding: 0, 
                                  color: '#94A3B8', cursor: 'pointer', display: 'flex'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                              >
                                <X size={14} strokeWidth={3} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p style={{ margin: 0, color: '#334155', lineHeight: '1.65', fontSize: '0.98rem' }}>{c.text}</p>
                      </div>
                    </div>
                  );
                })}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Ticket Details Card */}
          <div className="glass-card animate-slide-up hover-lift" style={{
            borderRadius: '24px', overflow: 'hidden', border: 'none',
            background: '#FFFFFF', boxShadow: '0 25px 60px rgba(0,0,0,0.06)',
            animationDelay: '0.2s'
          }}>
            {/* Card header */}
            <div style={{
              padding: '24px 28px', background: 'linear-gradient(135deg, #1E3A8A, #162d6e)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1
              }}>
                <Shield size={80} color="#fff" />
              </div>
              <h4 style={{
                margin: 0, color: '#FFFFFF', fontSize: '0.85rem',
                fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <Hash size={16} /> Asset Identification
              </h4>
            </div>

            <div style={{ padding: '32px' }}>
              {[
                { label: 'Priority Level', icon: <TrendingUp size={16} />, content: (
                  <span style={{
                    padding: '6px 14px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    color: ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? '#B91C1C' : ticket.priority === 'LOW' ? '#065F46' : '#B45309',
                    background: ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? '#FEF2F2' : ticket.priority === 'LOW' ? '#ECFDF5' : '#FFFBEB',
                    border: '1px solid rgba(0,0,0,0.03)'
                  }}>
                    {ticket.priority}
                  </span>
                )},
                { label: 'Issue Category', icon: <Tag size={16} />, content: ticket.category?.replace('_', ' ') || 'Not Categorized' },
                { label: 'Specific Location', icon: <MapPin size={16} />, content: ticket.resourceLocation || 'Unknown' },
                { label: 'Technician assigned', icon: <UserCog size={16} />, content: ticket.assignedTechnician || (
                  <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={14} /> Unassigned
                  </span>
                )},
                { label: 'Requestor Name', icon: <User size={16} />, content: ticket.contactName },
                { label: 'Registry Email', icon: <Mail size={16} />, content: ticket.contactEmail || 'No email provided' },
                { label: 'Direct Contract', icon: <Phone size={16} />, content: ticket.contactPhone || 'No phone provided' },
              ].map(({ label, icon, content }, i, arr) => (
                <div key={label} style={{
                  paddingBottom: i < arr.length - 1 ? '18px' : 0,
                  marginBottom: i < arr.length - 1 ? '18px' : 0,
                  borderBottom: i < arr.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8',
                    marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>
                    <span style={{ color: '#3B82F6', opacity: 0.8 }}>{icon}</span> {label}
                  </span>
                  <div style={{ color: '#1E293B', fontWeight: 700, fontSize: '1rem', paddingLeft: '2px' }}>
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attached Images */}
          {ticket.imageUrls && ticket.imageUrls.length > 0 && (
            <div className="glass-card animate-slide-up hover-lift" style={{
              borderRadius: '24px', padding: '28px',
              background: '#FFFFFF', boxShadow: '0 25px 60px rgba(0,0,0,0.06)',
              animationDelay: '0.3s'
            }}>
              <h4 style={{
                margin: '0 0 18px 0', color: '#1E3A8A', fontSize: '0.85rem',
                fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <Calendar size={16} /> Attached Evidence
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {ticket.imageUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', overflow: 'hidden', borderRadius: '14px' }}>
                    <img src={url} alt={`Attachment ${i + 1}`} style={{
                      width: '100%', borderRadius: '14px', objectFit: 'cover',
                      aspectRatio: '1', border: '1px solid #F1F5F9',
                      transition: 'transform 0.3s ease',
                    }} 
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button className="hover-lift" disabled={isUpdating} onClick={() => setShowStatusModal(false)}
                style={{
                  padding: '12px 24px', background: '#FFFFFF', color: '#1E293B',
                  border: '1px solid #E2E8F0', borderRadius: '12px',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                Cancel
              </button>
              <button title="Confirm and apply changes" className="hover-lift" disabled={isUpdating} onClick={handleStatusUpdate}
                style={{
                  padding: '12px 28px', fontWeight: 700, fontSize: '0.9rem',
                  border: 'none', borderRadius: '12px', cursor: 'pointer', color: '#FFFFFF',
                  background: statusUpdateData.status === 'RESOLVED' ? 'linear-gradient(135deg, #16A34A, #15803D)'
                    : statusUpdateData.status === 'REJECTED' ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'linear-gradient(135deg, #1E3A8A, #162d6e)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                }}>
                {isUpdating ? 'Applying…' : 'Finalize Update'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Deletion Confirmation Modal ── */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div className="animate-slide-up" style={{
            width: '100%', maxWidth: '400px', background: '#FFFFFF',
            borderRadius: '20px', padding: '32px', textAlign: 'center',
            boxShadow: '0 25px 70px rgba(0,0,0,0.3)', border: '1px solid #E5E7EB',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', background: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#DC2626', margin: '0 auto 20px'
            }}>
              <AlertTriangle size={32} />
            </div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>
              Confirm Deletion
            </h3>
            <p style={{ color: '#64748B', marginBottom: '28px', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Are you sure you want to permanently delete **Ticket #{ticket.id.slice(-5)}**? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="hover-lift" onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1, padding: '12px', background: '#F8FAFC', color: '#475569',
                  border: '1px solid #E2E8F0', borderRadius: '12px',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
                }}>
                Keep Ticket
              </button>
              <button className="hover-lift" disabled={isUpdating} onClick={handleDeleteTicket}
                style={{
                  flex: 1, padding: '12px', background: '#DC2626', color: '#FFFFFF',
                  border: 'none', borderRadius: '12px', fontWeight: 700,
                  fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(220,38,38,0.25)'
                }}>
                {isUpdating ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;