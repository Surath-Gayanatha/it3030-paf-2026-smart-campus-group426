import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Clock, MapPin, User, AlertCircle, CheckCircle } from 'lucide-react';
import API from '../api/api';

const TicketDetail = ({ isAdmin = false }) => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({ status: '', notes: '' });

  const fetchTicket = async () => {
    try {
      const res = await API.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      const payload = {
        status: statusUpdateData.status,
        resolutionNotes: statusUpdateData.status === 'RESOLVED' ? statusUpdateData.notes : null,
        rejectionReason: statusUpdateData.status === 'REJECTED' ? statusUpdateData.notes : null,
        assignedTechnician: statusUpdateData.status === 'IN_PROGRESS' ? 'Current User' : null
      };

      await API.patch(`/tickets/${id}/status`, payload);
      setShowStatusModal(false);
      fetchTicket();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    setCommentText('');
  };

  if (!ticket) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Ticket...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/tickets">
            <button className="secondary-btn" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}><ArrowLeft size={18} /></button>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`status-chip status-${ticket.status}`}>{ticket.status.replace('_', ' ')}</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Ticket #{ticket.id.slice(-5)}</h2>
          </div>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {ticket.status === 'OPEN' && (
              <button className="premium-btn" onClick={() => { setStatusUpdateData({ status: 'IN_PROGRESS', notes: '' }); setShowStatusModal(true); }}>
                Accept & Start
              </button>
            )}
            {ticket.status === 'IN_PROGRESS' && (
              <>
                <button className="premium-btn" onClick={() => { setStatusUpdateData({ status: 'RESOLVED', notes: '' }); setShowStatusModal(true); }}>
                  Mark Resolved
                </button>
                <button className="secondary-btn" style={{ color: '#EF4444' }} onClick={() => { setStatusUpdateData({ status: 'REJECTED', notes: '' }); setShowStatusModal(true); }}>
                  Reject
                </button>
              </>
            )}
            {(ticket.status === 'RESOLVED' || ticket.status === 'REJECTED') && (
              <button className="secondary-btn" onClick={() => { setStatusUpdateData({ status: 'CLOSED', notes: '' }); handleStatusUpdate(); }}>
                Close Ticket
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '32px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={22} color="var(--primary-accent)" /> 
              Issue Description
            </h3>
            <div style={{ lineHeight: '1.7', color: 'var(--text-primary)', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', fontSize: '1.05rem' }}>
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

          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageSquare size={22} color="var(--secondary-accent)" /> Discussion Thread
            </h3>
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No comments yet. Start the discussion below.
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h4 style={{ margin: '0 0 20px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket Status</h4>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>PRIORITY</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="priority-indicator" style={{ background: `var(--priority-${ticket.priority.toLowerCase()})` }}></span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{ticket.priority}</span>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>ASSIGNED TECHNICIAN</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ticket.assignedTechnician || 'Unassigned'}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>REPORTED BY</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ticket.contactName}</span>
            </div>
          </div>
        </div>
      </div>

      {showStatusModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '450px', padding: '32px', background: '#FFF' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Update Ticket Status</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {statusUpdateData.status === 'RESOLVED' ? 'Please provide details on how the issue was resolved.' : 
               statusUpdateData.status === 'REJECTED' ? 'Please explain why this request is being rejected.' : 
               'Confirm you are taking responsibility for this ticket.'}
            </p>
            
            {(statusUpdateData.status === 'RESOLVED' || statusUpdateData.status === 'REJECTED') && (
              <textarea 
                className="premium-input" 
                placeholder="Enter notes here..." 
                rows="4" 
                value={statusUpdateData.notes}
                onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
                required
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="secondary-btn" onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button className="premium-btn" onClick={handleStatusUpdate}>Confirm Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
