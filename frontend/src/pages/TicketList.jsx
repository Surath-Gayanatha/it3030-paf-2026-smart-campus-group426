import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, AlertCircle, Clock, MapPin, User, ChevronRight, ShieldCheck, Trash2, AlertTriangle, LayoutList, BarChart3 } from 'lucide-react';
import { useTimeSince } from '../hooks/useTimeSince';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  OPEN:        { color: '#1E3A8A', background: '#DBEAFE', border: '1px solid #BFDBFE' },
  IN_PROGRESS: { color: '#92400E', background: '#FEF3C7', border: '1px solid #FDE68A' },
  RESOLVED:    { color: '#065F46', background: '#D1FAE5', border: '1px solid #A7F3D0' },
  REJECTED:    { color: '#991B1B', background: '#FEE2E2', border: '1px solid #FECACA' },
  CLOSED:      { color: '#374151', background: '#F3F4F6', border: '1px solid #E5E7EB' },
};

const PRIORITY_STYLES = {
  LOW:      { color: '#065F46', background: '#D1FAE5' },
  MEDIUM:   { color: '#92400E', background: '#FEF3C7' },
  HIGH:     { color: '#991B1B', background: '#FEE2E2' },
  CRITICAL: { color: '#4C1D95', background: '#EDE9FE' },
};

const TicketCard = ({ ticket, user, onDeleteTrigger }) => {
  const timeSince = useTimeSince(ticket.createdAt);
  const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.CLOSED;
  const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM;

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      style={{
        padding: '24px',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(30,58,138,0.1), 0 4px 6px rgba(0,0,0,0.05)';
        e.currentTarget.style.borderColor = '#93C5FD';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = '#E5E7EB';
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: ticket.status === 'OPEN' ? '#1E3A8A'
          : ticket.status === 'IN_PROGRESS' ? '#F59E0B'
          : ticket.status === 'RESOLVED' ? '#16A34A'
          : '#DC2626',
        borderRadius: '12px 12px 0 0',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            ...statusStyle,
            padding: '4px 10px', borderRadius: '999px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.03em',
          }}>
            {ticket.status.replace('_', ' ')}
          </span>
          <span style={{
            ...priorityStyle,
            padding: '3px 8px', borderRadius: '6px',
            fontSize: '0.72rem', fontWeight: 700,
          }}>
            {ticket.priority}
          </span>
        </div>

        {/* Delete Button overlay */}
        {(user?.role === 'ADMIN' || (ticket.createdBy === user?.email && ticket.status === 'OPEN')) && (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteTrigger(ticket); }}
            title="Delete Ticket"
            style={{
              padding: '6px', borderRadius: '6px', background: 'rgba(239,68,68,0.08)',
              color: '#DC2626', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', marginLeft: 'auto'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '0.78rem', color: '#6B7280', fontWeight: 500,
        background: '#F9FAFB', padding: '4px 10px', borderRadius: '999px',
        border: '1px solid #E5E7EB',
      }}>
        {ticket.status === 'OPEN' && (
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#3B82F6', display: 'inline-block',
            animation: 'pulse 2s infinite',
          }} />
        )}
        <Clock size={12} />
        {timeSince}
      </div>

      <h3 style={{
        margin: '16px 0 8px 0', fontSize: '1rem', fontWeight: 700,
        color: '#1E3A8A', letterSpacing: '-0.01em',
      }}>
        Ticket #{ticket.id.slice(-5)}
      </h3>

      <p style={{
        margin: '0 0 20px 0', fontSize: '0.9rem', color: '#4B5563',
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6',
      }}>
        {ticket.description}
      </p>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '14px', borderTop: '1px solid #F3F4F6', fontSize: '0.82rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={13} color="#3B82F6" /> {ticket.resourceLocation}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={13} color="#3B82F6" /> {ticket.contactName}
          </span>
        </div>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid #BFDBFE',
        }}>
          <ChevronRight size={15} color="#1E3A8A" />
        </div>
      </div>
    </Link>
  );
};

const TicketHero = ({ isAdmin, isAssignedView, counts, navigate }) => (
  <div style={{
    background: 'linear-gradient(rgba(30, 58, 138, 0.6), rgba(30, 58, 138, 0.65)), url("/campus_maintenance_hero.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '24px',
    padding: '48px 40px',
    marginBottom: '40px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(30,58,138,0.2), 0 10px 15px rgba(0,0,0,0.1)',
    color: '#FFFFFF'
  }}>
    {/* Abstract Background pattern */}
    <div style={{
      position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
      borderRadius: '50%'
    }} />

    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)',
            padding: '6px 14px', borderRadius: '99px', fontSize: '0.75rem',
            fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
            marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <ShieldCheck size={14} />
            {isAdmin ? 'Admin Control Center' : isAssignedView ? 'Technician Hub' : 'Campus Support Hub'}
          </div>
          
          <h1 style={{
            fontSize: '2.5rem', fontWeight: 800, margin: '0 0 12px 0',
            letterSpacing: '-0.02em', lineHeight: 1.1, color: '#FFFFFF',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {isAdmin ? 'Manage Operations' : isAssignedView ? 'Your Tasks' : 'Maintenance & Support'}
          </h1>
          
          <p style={{
            fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)',
            maxWidth: '500px', margin: 0, lineHeight: 1.5,
            textShadow: '0 1px 4px rgba(0,0,0,0.2)'
          }}>
            {isAdmin 
              ? 'Complete oversight of all campus maintenance and technical support requests.'
              : isAssignedView ? 'View and manage all service requests assigned to your technical profile.'
              : 'Effortlessly report issues and track the resolution of your campus maintenance requests.'}
          </p>

          <div style={{ display: 'flex', gap: '14px', marginTop: '32px' }}>
            {!isAssignedView && (
              <Link to="/tickets/create" style={{ textDecoration: 'none' }}>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', fontWeight: 700, fontSize: '0.9rem',
                  background: '#FFFFFF', color: '#1E3A8A',
                  border: 'none', borderRadius: '12px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,255,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                >
                  <Plus size={18} /> New Request
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats segment */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px',
          minWidth: '240px'
        }}>
          {[
            { label: 'Pending', val: counts.OPEN, color: '#3B82F6' },
            { label: 'Active', val: counts.IN_PROGRESS, color: '#F59E0B' },
            { label: 'Solved', val: counts.RESOLVED, color: '#10B981' },
            { label: 'Total', val: counts.ALL, color: '#FFFFFF' }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '16px', width: '120px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TicketList = ({ isAdmin = false, isAssignedView = false }) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets]         = useState([]);
  const [filter, setFilter]           = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [counts, setCounts]           = useState({ ALL: 0, OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const fetchTickets = async () => {
    setLoading(true); setError(null);
    try {
      let endpoint = isAdmin ? '/tickets' : '/tickets/my';
      if (isAssignedView) endpoint = '/tickets/assigned';
      const res = await API.get(endpoint);
      setTickets(res.data);
      setCounts({
        ALL:         res.data.length,
        OPEN:        res.data.filter(t => t.status === 'OPEN').length,
        IN_PROGRESS: res.data.filter(t => t.status === 'IN_PROGRESS').length,
        RESOLVED:    res.data.filter(t => t.status === 'RESOLVED').length,
        CLOSED:      res.data.filter(t => t.status === 'CLOSED').length,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (authLoading) return;
    if (!user) { setError('You must be logged in to view tickets.'); setLoading(false); return; }
    fetchTickets();
  }, [isAdmin, isAssignedView, authLoading, user]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/tickets/${deleteTarget.id}`);
      fetchTickets();
      setDeleteTarget(null);
    } catch {
      alert('Failed to delete ticket.');
    } finally { setDeleting(false); }
  };

  const filteredTickets = tickets.filter(t => {
    const statusMatch = filter === 'ALL' || t.status === filter;
    const q = searchQuery.toLowerCase();
    const searchMatch =
      t.description?.toLowerCase().includes(q) ||
      t.resourceLocation?.toLowerCase().includes(q) ||
      t.id?.toLowerCase().includes(q);
    return statusMatch && searchMatch;
  });

  if (authLoading) return (
    <div style={{ padding: '80px', textAlign: 'center', color: '#6B7280' }}>Checking authentication…</div>
  );

  if (error) return (
    <div style={{ padding: '80px', textAlign: 'center' }}>
      <AlertCircle size={48} color="#DC2626" style={{ marginBottom: '16px', margin: '0 auto 16px' }} />
      <p style={{ color: '#DC2626', fontWeight: 600 }}>{error}</p>
    </div>
  );

  const TAB_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>

      {/* ── Ticket Hero ── */}
      <TicketHero 
        isAdmin={isAdmin} 
        isAssignedView={isAssignedView} 
        counts={counts}
        navigate={navigate} 
      />

      {/* ── Content ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '32px', gap: '20px', flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex', gap: '6px',
          background: '#F1F5F9', padding: '5px',
          borderRadius: '10px', flexWrap: 'wrap',
          border: '1px solid #E5E7EB',
        }}>
          {TAB_FILTERS.map(f => {
            const displayLabel = isAssignedView && f === 'OPEN' ? 'ASSIGNED' : f.replace('_', ' ');
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 14px', border: 'none', borderRadius: '7px',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  background: filter === f ? '#1E3A8A' : 'transparent',
                  color: filter === f ? '#FFFFFF' : '#6B7280',
                  boxShadow: filter === f ? '0 2px 8px rgba(30,58,138,0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: '7px',
                }}
              >
                {displayLabel}
                <span style={{
                  fontSize: '0.72rem',
                  background: filter === f ? 'rgba(255,255,255,0.25)' : '#CBD5E1',
                  color: filter === f ? '#FFFFFF' : '#6B7280',
                  padding: '1px 7px', borderRadius: '999px', fontWeight: 700,
                }}>
                  {counts[f] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
          <Search size={16} color="#9CA3AF" style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search tickets…"
            style={{
              width: '100%', paddingLeft: '42px', paddingRight: '16px',
              paddingTop: '10px', paddingBottom: '10px',
              border: '1.5px solid #E5E7EB', borderRadius: '8px',
              fontSize: '0.875rem', color: '#1F2937', background: '#FFFFFF',
              outline: 'none', transition: 'border-color 0.18s ease',
              fontFamily: 'Inter, sans-serif',
            }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={e => { e.currentTarget.style.borderColor = '#1E3A8A'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
          />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{
          padding: '80px', textAlign: 'center', color: '#6B7280',
          background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E5E7EB',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '3px solid #DBEAFE', borderTopColor: '#1E3A8A',
            margin: '0 auto 16px', animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ margin: 0, fontWeight: 600, color: '#1E3A8A' }}>Loading tickets…</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div style={{
          padding: '80px 40px', textAlign: 'center',
          background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#DBEAFE', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <AlertCircle size={26} color="#1E3A8A" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontWeight: 700, color: '#1E3A8A', fontSize: '1.1rem' }}>
            No tickets found
          </h3>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredTickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} user={user} onDeleteTrigger={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Deletion Modal */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            width: '100%', maxWidth: '400px', background: '#FFFFFF',
            borderRadius: '20px', padding: '32px', textAlign: 'center',
            boxShadow: '0 25px 70px rgba(0,0,0,0.3)', border: '1px solid #E5E7EB',
            animation: 'adm-fade-in 0.3s ease forwards',
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
              Are you sure you want to permanently delete **Ticket #{deleteTarget.id.slice(-5)}**?
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1, padding: '12px', background: '#F8FAFC', color: '#475569',
                  border: '1px solid #E2E8F0', borderRadius: '12px',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
                }}>
                Cancel
              </button>
              <button disabled={deleting} onClick={handleDelete}
                style={{
                  flex: 1, padding: '12px', background: '#DC2626', color: '#FFFFFF',
                  border: 'none', borderRadius: '12px', fontWeight: 700,
                  fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(220,38,38,0.25)'
                }}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes adm-fade-in {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TicketList;