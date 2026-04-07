import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Clock, MapPin, AlertCircle, ChevronRight, User } from 'lucide-react';
import { useTimeSince } from '../hooks/useTimeSince';
import API from '../api/api';

const TicketCard = ({ ticket }) => {
  const timeSince = useTimeSince(ticket.createdAt);
  
  return (
    <Link to={`/tickets/${ticket.id}`} className="glass-panel animate-fade-in" 
         style={{ padding: '24px', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.2s ease, box-shadow 0.2s ease', position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`status-chip status-${ticket.status}`}>{ticket.status.replace('_', ' ')}</span>
          <span className="priority-indicator" style={{ background: `var(--priority-${ticket.priority.toLowerCase()})` }} title={`Priority: ${ticket.priority}`}></span>
        </div>
        <div className="countdown-timer">
          {ticket.status === 'OPEN' && <div className="pulsing-dot" />}
          <Clock size={14} /> {timeSince}
        </div>
      </div>

      <h3 style={{ margin: '0 0 12px 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        Ticket #{ticket.id.slice(-5)}
      </h3>
      
      <p style={{ margin: '0 0 20px 0', fontSize: '0.95rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
        {ticket.description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #F1F5F9', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {ticket.resourceLocation}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {ticket.contactName}</span>
        </div>
        <ChevronRight size={18} color="#CBD5E1" />
      </div>
    </Link>
  );
};

const TicketList = ({ isAdmin = false }) => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [counts, setCounts] = useState({ ALL: 0, OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const endpoint = isAdmin ? '/tickets' : '/tickets/my';
        const res = await API.get(endpoint);
        setTickets(res.data);
        
        // Calculate counts
        const newCounts = {
          ALL: res.data.length,
          OPEN: res.data.filter(t => t.status === 'OPEN').length,
          IN_PROGRESS: res.data.filter(t => t.status === 'IN_PROGRESS').length,
          RESOLVED: res.data.filter(t => t.status === 'RESOLVED').length
        };
        setCounts(newCounts);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      }
    };
    fetchTickets();
  }, [isAdmin]);

  const filteredTickets = tickets.filter(t => {
    const statusMatch = filter === 'ALL' || t.status === filter;
    const searchMatch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      t.resourceLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2.25rem', fontWeight: 800 }}>
            {isAdmin ? 'Management Console' : 'My Support Tickets'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1.05rem' }}>
            {isAdmin ? 'Oversee and resolve all campus maintenance requests.' : 'Track the status of your reported issues and requests.'}
          </p>
        </div>
        <Link to="/tickets/new">
          <button className="premium-btn" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> Create Ticket
          </button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '6px', borderRadius: '12px' }}>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                background: filter === f ? '#FFFFFF' : 'transparent',
                color: filter === f ? 'var(--primary-accent)' : '#64748B',
                boxShadow: filter === f ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {f.replace('_', ' ')}
              <span style={{ fontSize: '0.75rem', opacity: 0.6, background: filter === f ? 'var(--primary-accent)' : '#94A3B8', color: '#FFF', padding: '2px 6px', borderRadius: '10px' }}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="premium-input" 
            placeholder="Search tickets..." 
            style={{ paddingLeft: '48px', marginBottom: 0 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="glass-panel" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>No tickets found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredTickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
