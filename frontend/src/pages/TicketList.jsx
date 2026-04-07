import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import { Filter, Plus } from 'lucide-react';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Hardcoded mock tickets until standard authentication header issue is sorted
  useEffect(() => {
    setTickets([
      { id: 1, resourceLocation: 'Lab 402', category: 'IT_EQUIPMENT', priority: 'HIGH', status: 'OPEN', description: 'Projector turning off randomly.', contactName: 'John Doe', createdAt: '2026-04-07T08:00:00' },
      { id: 2, resourceLocation: 'Building A Restroom', category: 'PLUMBING', priority: 'MEDIUM', status: 'IN_PROGRESS', description: 'Sink leaking continuously.', contactName: 'Jane Smith', createdAt: '2026-04-06T14:30:00' },
      { id: 3, resourceLocation: 'Library 2nd Floor', category: 'ELECTRICAL', priority: 'CRITICAL', status: 'RESOLVED', description: 'Power outage in study zone.', contactName: 'Admin', createdAt: '2026-04-05T09:15:00' },
    ]);
  }, []);

  const filteredTickets = statusFilter 
    ? tickets.filter(t => t.status === statusFilter) 
    : tickets;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>Ticket Management</h1>
        <Link to="/tickets/new" style={{ textDecoration: 'none' }}>
          <button className="premium-btn">
            <Plus size={18} /> Create Ticket
          </button>
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Filter size={20} color="var(--text-secondary)" />
        <select 
          className="premium-input" 
          style={{ width: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {filteredTickets.map(ticket => (
          <Link key={ticket.id} to={`/tickets/${ticket.id}`} style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>{ticket.description}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                  {ticket.resourceLocation} • {ticket.category} • Requested by {ticket.contactName}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className={`status-chip status-${ticket.status}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TicketList;
