import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Clock, MapPin, User, AlertCircle } from 'lucide-react';

const TicketDetail = () => {
  const { id } = useParams();
  const [commentText, setCommentText] = useState('');

  // Mock Ticket Details
  const ticket = {
    id: id,
    resourceLocation: 'Lab 402',
    category: 'IT_EQUIPMENT',
    priority: 'HIGH',
    status: 'OPEN',
    description: 'The main projector is turning off completely at random intervals (roughly every 15 mins). It requires a hard reset to turn back on.',
    contactName: 'John Doe',
    contactEmail: 'john@camp.us',
    createdAt: '2026-04-07 08:00 AM',
    assignedTechnician: 'Not Assigned',
    comments: [
      { id: 101, text: 'I am taking a look at this logs immediately.', author: 'admin', createdAt: '2026-04-07 08:20 AM' }
    ]
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    setCommentText(''); // Mock submit logic
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link to="/tickets">
          <button className="secondary-btn" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}><ArrowLeft size={18} /></button>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`status-chip status-${ticket.status}`}>{ticket.status.replace('_', ' ')}</span>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Ticket #{ticket.id}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '32px' }}>
        
        {/* Left Column - Main Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={22} color="var(--primary-accent)" /> 
              Issue Description
            </h3>
            <div style={{ lineHeight: '1.7', color: 'var(--text-primary)', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', fontSize: '1.05rem' }}>
              {ticket.description}
            </div>

            <div style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> {ticket.resourceLocation}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> {ticket.createdAt}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} /> {ticket.contactName}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageSquare size={22} color="var(--secondary-accent)" /> 
              Discussion Thread
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              {ticket.comments.map(c => (
                <div key={c.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--primary-accent)', fontWeight: 700 }}>@{c.author}</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{c.createdAt}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '12px' }}>
              <input type="text" className="premium-input" placeholder="Add a comment or update..." 
                     value={commentText} onChange={e => setCommentText(e.target.value)} required />
              <button type="submit" className="premium-btn">Post</button>
            </form>
          </div>

        </div>

        {/* Right Column - Metadata Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h4 style={{ margin: '0 0 20px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket Status</h4>
            
            <div style={{ marginBottom: '20px' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>PRIORITY</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="priority-indicator" style={{ background: `var(--priority-${ticket.priority.toLowerCase()})` }}></span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                  {ticket.priority}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>CATEGORY</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ticket.category.replace('_', ' ')}</span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>ASSIGNED TECHNICIAN</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ticket.assignedTechnician}</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <h4 style={{ margin: '0 0 20px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attached Evidence</h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
               <div style={{ width: '100%', height: '100px', background: '#F1F5F9', border: '1px dashed #CBD5E1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>
                 No images attached
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
