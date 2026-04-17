import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, AlertCircle, Clock, MapPin, User, ChevronRight, ShieldCheck } from 'lucide-react';
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

const TicketCard = ({ ticket }) => {
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
      </div>

      <h3 style={{
        margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 700,
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

const TicketList = ({ isAdmin = false }) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets]         = useState([]);
  const [filter, setFilter]           = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [counts, setCounts]           = useState({ ALL: 0, OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setError('You must be logged in to view tickets.'); setLoading(false); return; }

    const fetchTickets = async () => {
      setLoading(true); setError(null);
      try {
        const endpoint = isAdmin ? '/tickets' : '/tickets/my';
        const res = await API.get(endpoint);
        setTickets(res.data);
        setCounts({
          ALL:         res.data.length,
          OPEN:        res.data.filter(t => t.status === 'OPEN').length,
          IN_PROGRESS: res.data.filter(t => t.status === 'IN_PROGRESS').length,
          RESOLVED:    res.data.filter(t => t.status === 'RESOLVED').length,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tickets.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [isAdmin, authLoading, user]);

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

  const TAB_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: '40px', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          {/* Eyebrow label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#DBEAFE', color: '#1E3A8A',
            padding: '4px 12px', borderRadius: '999px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: '12px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
            {isAdmin ? 'Admin Console' : 'Support Portal'}
          </div>
          <h1 style={{
            margin: '0 0 8px 0', fontSize: '2.25rem', fontWeight: 700,
            color: '#1E3A8A', fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em',
          }}>
            {isAdmin ? 'Management Console' : 'My Support Tickets'}
          </h1>
          <p style={{ color: '#6B7280', fontWeight: 500, fontSize: '1rem', margin: 0 }}>
            {isAdmin
              ? 'Oversee and resolve all campus maintenance requests.'
              : 'Track the status of your reported issues and requests.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', fontWeight: 600, fontSize: '0.875rem',
              background: '#FFFFFF', color: '#1E3A8A',
              border: '1.5px solid #1E3A8A', borderRadius: '8px',
              cursor: 'pointer', transition: 'all 0.18s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
          >
            <ShieldCheck size={17} color="#1E3A8A" />
            Admin View
          </button>

          <Link to="/tickets/create">
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px', fontWeight: 600, fontSize: '0.875rem',
              background: '#1E3A8A', color: '#FFFFFF',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30,58,138,0.3)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#162d6e'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(30,58,138,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1E3A8A'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,58,138,0.3)'; }}
            >
              <Plus size={18} /> Create Ticket
            </button>
          </Link>
        </div>
      </div>

      {/* ── Filter Tabs + Search ── */}
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
          {TAB_FILTERS.map(f => (
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
              {f.replace('_', ' ')}
              <span style={{
                fontSize: '0.72rem',
                background: filter === f ? 'rgba(255,255,255,0.25)' : '#CBD5E1',
                color: filter === f ? '#FFFFFF' : '#6B7280',
                padding: '1px 7px', borderRadius: '999px', fontWeight: 700,
              }}>
                {counts[f] ?? 0}
              </span>
            </button>
          ))}
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
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
};

export default TicketList;