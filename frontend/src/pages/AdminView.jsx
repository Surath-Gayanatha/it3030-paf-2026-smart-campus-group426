import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Clock, CheckCircle, XCircle, AlertCircle, Search,
  Filter, ChevronDown, UserCheck, RefreshCw, Eye, Wrench,
  TrendingUp, Activity, ArrowUpRight, X, ChevronRight
} from 'lucide-react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_META = {
  OPEN:        { label: 'Open',        color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  IN_PROGRESS: { label: 'In Progress', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  RESOLVED:    { label: 'Resolved',    color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  REJECTED:    { label: 'Rejected',    color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
  CLOSED:      { label: 'Closed',      color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
};

const PRIORITY_META = {
  LOW:      { color: '#10B981', bg: '#ECFDF5' },
  MEDIUM:   { color: '#F59E0B', bg: '#FFFBEB' },
  HIGH:     { color: '#EF4444', bg: '#FEF2F2' },
  CRITICAL: { color: '#7C3AED', bg: '#F5F3FF' },
};

const timeSince = (iso) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const TECHNICIANS = [
  'Alice Fernando', 'Bob Perera', 'Chamara Silva',
  'Dilshan Jayawardena', 'Eranga Bandara', 'Fathima Rizvi',
];

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </p>
        {trend && (
          <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> {trend}
          </p>
        )}
      </div>
      <div style={{ padding: '12px', borderRadius: '12px', background: color + '20' }}>
        <Icon size={22} color={color} />
      </div>
    </div>
    <div style={{
      position: 'absolute', bottom: 0, right: 0,
      width: '80px', height: '80px', borderRadius: '50%',
      background: color + '08', transform: 'translate(20px, 20px)'
    }} />
  </div>
);

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.CLOSED;
  return (
    <span style={{
      padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
      color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
      whiteSpace: 'nowrap'
    }}>
      {meta.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const meta = PRIORITY_META[priority] || PRIORITY_META.MEDIUM;
  return (
    <span style={{
      padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
      color: meta.color, background: meta.bg, whiteSpace: 'nowrap'
    }}>
      {priority}
    </span>
  );
};

// ─── Assign Technician Modal ────────────────────────────────────────────────

const AssignModal = ({ ticket, onClose, onAssigned }) => {
  const [selected, setSelected] = useState(ticket.assignedTechnician || '');
  const [custom, setCustom]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const technician = custom.trim() || selected;

  const handleAssign = async () => {
    if (!technician) { setError('Please select or enter a technician.'); return; }
    setLoading(true);
    try {
      await API.patch(`/tickets/${ticket.id}/status`, {
        status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
        assignedTechnician: technician,
      });
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign technician.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800 }}>Assign Technician</h3>
      <p style={{ margin: '0 0 24px 0', color: '#64748B', fontSize: '0.9rem' }}>
        Ticket <strong>#{ticket.id.slice(-5)}</strong> · {ticket.category?.replace('_', ' ')}
      </p>

      <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Available Technicians
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {TECHNICIANS.map(t => (
          <button
            key={t}
            onClick={() => { setSelected(t); setCustom(''); }}
            style={{
              padding: '12px 16px', borderRadius: '10px', border: '2px solid',
              borderColor: selected === t && !custom ? 'var(--primary-accent)' : '#E2E8F0',
              background: selected === t && !custom ? '#EEF2FF' : '#F8FAFC',
              textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              fontWeight: selected === t && !custom ? 700 : 500,
              color: selected === t && !custom ? 'var(--primary-accent)' : 'var(--text-primary)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: selected === t && !custom ? 'var(--primary-accent)' : '#CBD5E1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0
            }}>
              {t.split(' ').map(n => n[0]).join('')}
            </div>
            {t}
          </button>
        ))}
      </div>

      <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Or Enter Custom Name
      </p>
      <input
        className="premium-input"
        placeholder="Type technician name…"
        value={custom}
        onChange={e => { setCustom(e.target.value); setSelected(''); }}
        style={{ marginBottom: '16px' }}
      />

      {error && <p style={{ color: '#EF4444', fontSize: '0.85rem', margin: '0 0 12px 0' }}>⚠️ {error}</p>}

      {ticket.status === 'OPEN' && (
        <p style={{ fontSize: '0.82rem', color: '#F59E0B', background: '#FFFBEB', padding: '10px 14px', borderRadius: '8px', margin: '0 0 16px 0' }}>
          ℹ️ Assigning will automatically move ticket to <strong>In Progress</strong>.
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button className="secondary-btn" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="premium-btn" onClick={handleAssign} disabled={loading}>
          {loading ? 'Assigning…' : <><UserCheck size={16} style={{ marginRight: '6px' }} />Assign</>}
        </button>
      </div>
    </Overlay>
  );
};

// ─── Status Update Modal ─────────────────────────────────────────────────────

const StatusModal = ({ ticket, onClose, onUpdated }) => {
  const nextStatuses = {
    OPEN:        ['IN_PROGRESS', 'REJECTED'],
    IN_PROGRESS: ['RESOLVED', 'REJECTED'],
    RESOLVED:    ['CLOSED'],
    REJECTED:    ['CLOSED'],
  };
  const options = nextStatuses[ticket.status] || [];

  const [newStatus, setNewStatus] = useState(options[0] || '');
  const [notes, setNotes]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const needsNotes = newStatus === 'RESOLVED' || newStatus === 'REJECTED';

  const handleUpdate = async () => {
    if (needsNotes && !notes.trim()) { setError('Please provide notes.'); return; }
    setLoading(true);
    try {
      await API.patch(`/tickets/${ticket.id}/status`, {
        status: newStatus,
        resolutionNotes: newStatus === 'RESOLVED' ? notes : null,
        rejectionReason: newStatus === 'REJECTED' ? notes : null,
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!options.length) {
    return (
      <Overlay onClose={onClose}>
        <h3 style={{ margin: '0 0 12px 0' }}>No Status Transitions</h3>
        <p style={{ color: '#64748B' }}>This ticket is <strong>{ticket.status}</strong> and cannot be moved further.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="secondary-btn" onClick={onClose}>Close</button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800 }}>Update Status</h3>
      <p style={{ margin: '0 0 24px 0', color: '#64748B', fontSize: '0.9rem' }}>
        Ticket <strong>#{ticket.id.slice(-5)}</strong> · currently <StatusBadge status={ticket.status} />
      </p>

      <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
        Move to
      </p>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {options.map(s => (
          <button
            key={s}
            onClick={() => setNewStatus(s)}
            style={{
              padding: '10px 18px', borderRadius: '10px', border: '2px solid',
              borderColor: newStatus === s ? STATUS_META[s]?.color : '#E2E8F0',
              background: newStatus === s ? STATUS_META[s]?.bg : '#F8FAFC',
              color: newStatus === s ? STATUS_META[s]?.color : '#64748B',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
              transition: 'all 0.15s ease',
            }}
          >
            {STATUS_META[s]?.label}
          </button>
        ))}
      </div>

      {needsNotes && (
        <>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            {newStatus === 'RESOLVED' ? 'Resolution Notes' : 'Rejection Reason'}
          </p>
          <textarea
            className="premium-input"
            rows="4"
            placeholder={newStatus === 'RESOLVED' ? 'Describe how the issue was resolved…' : 'Explain why this is being rejected…'}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box', marginBottom: '12px' }}
          />
        </>
      )}

      {error && <p style={{ color: '#EF4444', fontSize: '0.85rem', margin: '0 0 12px 0' }}>⚠️ {error}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
        <button className="secondary-btn" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="premium-btn" onClick={handleUpdate} disabled={loading}>
          {loading ? 'Updating…' : 'Confirm Update'}
        </button>
      </div>
    </Overlay>
  );
};

// ─── Overlay wrapper ─────────────────────────────────────────────────────────

const Overlay = ({ children, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '20px'
  }}>
    <div className="glass-panel animate-fade-in" style={{
      width: '100%', maxWidth: '520px', padding: '32px',
      background: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto', position: 'relative'
    }}>
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
      >
        <X size={20} />
      </button>
      {children}
    </div>
  </div>
);

// ─── Main AdminPanel ─────────────────────────────────────────────────────────

const AdminView = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriority]   = useState('ALL');
  const [sortBy, setSortBy]             = useState('createdAt');
  const [assignTarget, setAssignTarget] = useState(null);   // ticket to assign
  const [statusTarget, setStatusTarget] = useState(null);   // ticket to update status

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'ALL')   params.status   = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      const res = await API.get('/tickets', { params });
      setTickets(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    if (!authLoading) {
      if (user) fetchTickets();
      else setError('You must be logged in.');
    }
  }, [authLoading, user, fetchTickets]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const counts = {
    ALL: tickets.length,
    OPEN: tickets.filter(t => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
    REJECTED: tickets.filter(t => t.status === 'REJECTED').length,
    CLOSED: tickets.filter(t => t.status === 'CLOSED').length,
  };

  const unassigned = tickets.filter(t => !t.assignedTechnician && t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;

  const filtered = tickets
    .filter(t => {
      const q = search.toLowerCase();
      return (
        t.description?.toLowerCase().includes(q) ||
        t.contactName?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.resourceLocation?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'priority') {
        const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (order[a.priority] ?? 99) - (order[b.priority] ?? 99);
      }
      return 0;
    });

  // ── Render guards ─────────────────────────────────────────────────────────

  if (authLoading) return <div style={{ padding: '80px', textAlign: 'center', color: '#94A3B8' }}>Checking authentication…</div>;
  if (error) return (
    <div style={{ padding: '80px', textAlign: 'center' }}>
      <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
      <p style={{ color: '#EF4444', fontWeight: 600 }}>{error}</p>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--primary-accent)20' }}>
              <Activity size={22} color="var(--primary-accent)" />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Admin Console
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800 }}>Ticket Management</h1>
          <p style={{ margin: '8px 0 0', color: '#64748B', fontSize: '1rem' }}>
            Oversee, assign, and resolve all campus maintenance requests.
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="secondary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <StatCard icon={Activity}   label="Total Tickets"   value={counts.ALL}         color="#6366F1" />
        <StatCard icon={AlertCircle} label="Open"           value={counts.OPEN}        color="#3B82F6" />
        <StatCard icon={Clock}       label="In Progress"    value={counts.IN_PROGRESS} color="#F59E0B" />
        <StatCard icon={CheckCircle} label="Resolved"       value={counts.RESOLVED}    color="#10B981" />
        <StatCard icon={Users}       label="Unassigned"     value={unassigned}         color="#EF4444" trend={unassigned > 0 ? 'Need attention' : null} />
      </div>

      {/* ── Filter Bar ── */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '360px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              className="premium-input"
              placeholder="Search tickets, names, locations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '42px', marginBottom: 0 }}
            />
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '7px 14px', borderRadius: '8px', border: '1.5px solid',
                  borderColor: statusFilter === s ? (STATUS_META[s]?.color || 'var(--primary-accent)') : '#E2E8F0',
                  background: statusFilter === s ? (STATUS_META[s]?.bg || '#EEF2FF') : 'transparent',
                  color: statusFilter === s ? (STATUS_META[s]?.color || 'var(--primary-accent)') : '#64748B',
                  fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {s === 'ALL' ? 'All' : STATUS_META[s]?.label}
                <span style={{
                  background: statusFilter === s ? (STATUS_META[s]?.color || 'var(--primary-accent)') : '#CBD5E1',
                  color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '0.72rem', fontWeight: 700
                }}>
                  {s === 'ALL' ? counts.ALL : counts[s] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div style={{ position: 'relative' }}>
            <select
              className="premium-input"
              value={priorityFilter}
              onChange={e => setPriority(e.target.value)}
              style={{ marginBottom: 0, paddingRight: '36px', appearance: 'none', minWidth: '130px' }}
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94A3B8' }} />
          </div>

          {/* Sort */}
          <div style={{ position: 'relative' }}>
            <select
              className="premium-input"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ marginBottom: 0, paddingRight: '36px', appearance: 'none', minWidth: '140px' }}
            >
              <option value="createdAt">Newest First</option>
              <option value="priority">By Priority</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94A3B8' }} />
          </div>
        </div>
      </div>

      {/* ── Ticket Table ── */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '80px', textAlign: 'center', color: '#94A3B8' }}>
          <RefreshCw size={32} style={{ marginBottom: '16px', opacity: 0.4, animation: 'spin 1s linear infinite' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Loading tickets…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '80px', textAlign: 'center', color: '#94A3B8' }}>
          <Filter size={48} style={{ marginBottom: '16px', opacity: 0.25 }} />
          <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>No tickets found</h3>
          <p style={{ margin: 0 }}>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr 120px 100px 160px 140px 160px',
            gap: '0',
            padding: '14px 24px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
          }}>
            {['Ticket', 'Description', 'Category', 'Priority', 'Status', 'Technician', 'Actions'].map(h => (
              <span key={h} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {filtered.map((ticket, idx) => (
            <div
              key={ticket.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr 120px 100px 160px 140px 160px',
                gap: '0',
                padding: '18px 24px',
                borderBottom: idx < filtered.length - 1 ? '1px solid #F1F5F9' : 'none',
                alignItems: 'center',
                transition: 'background 0.15s ease',
                background: '#FFFFFF',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
            >
              {/* Ticket ID + time */}
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  #{ticket.id.slice(-5)}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                  {timeSince(ticket.createdAt)}
                </p>
              </div>

              {/* Description + reporter */}
              <div style={{ paddingRight: '16px' }}>
                <p style={{
                  margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4'
                }}>
                  {ticket.description}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: '#94A3B8' }}>
                  by {ticket.contactName} · {ticket.resourceLocation}
                </p>
              </div>

              {/* Category */}
              <div>
                <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px' }}>
                  {ticket.category?.replace('_', ' ') || '—'}
                </span>
              </div>

              {/* Priority */}
              <div><PriorityBadge priority={ticket.priority} /></div>

              {/* Status */}
              <div><StatusBadge status={ticket.status} /></div>

              {/* Technician */}
              <div>
                {ticket.assignedTechnician ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-accent)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0
                    }}>
                      {ticket.assignedTechnician.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {ticket.assignedTechnician}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 600 }}>Unassigned</span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  title="View ticket"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  style={{ padding: '7px', border: '1.5px solid #E2E8F0', borderRadius: '8px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748B', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-accent)'; e.currentTarget.style.color = 'var(--primary-accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
                >
                  <Eye size={15} />
                </button>

                {ticket.status !== 'CLOSED' && (
                  <button
                    title="Assign technician"
                    onClick={() => setAssignTarget(ticket)}
                    style={{ padding: '7px', border: '1.5px solid #E2E8F0', borderRadius: '8px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748B', transition: 'all 0.15s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
                  >
                    <Wrench size={15} />
                  </button>
                )}

                {ticket.status !== 'CLOSED' && (
                  <button
                    title="Update status"
                    onClick={() => setStatusTarget(ticket)}
                    style={{ padding: '7px', border: '1.5px solid #E2E8F0', borderRadius: '8px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748B', transition: 'all 0.15s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.color = '#F59E0B'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
                  >
                    <TrendingUp size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Table footer */}
          <div style={{ padding: '14px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
              Showing <strong>{filtered.length}</strong> of <strong>{tickets.length}</strong> tickets
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.82rem', color: '#64748B' }}>
              <Wrench size={14} /> Assign · <TrendingUp size={14} /> Status · <Eye size={14} /> View
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {assignTarget && (
        <AssignModal
          ticket={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={fetchTickets}
        />
      )}
      {statusTarget && (
        <StatusModal
          ticket={statusTarget}
          onClose={() => setStatusTarget(null)}
          onUpdated={fetchTickets}
        />
      )}
    </div>
  );
};

export default AdminView;