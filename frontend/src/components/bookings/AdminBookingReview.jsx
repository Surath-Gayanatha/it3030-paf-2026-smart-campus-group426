import React, { useState } from 'react';
import { updateBookingStatus } from '../../api/booking.api';
import './Bookings.css';

const AdminBookingReview = ({ booking, onClose, onRefresh }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);

    const handleReview = async (status) => {
        try {
            await updateBookingStatus(booking.id, { 
                status, 
                adminReason: status === 'REJECTED' ? reason : null 
            });
            onRefresh();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const parseDateObj = (dateVal) => {
        if (!dateVal) return new Date();
        if (Array.isArray(dateVal)) {
            return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0);
        }
        return new Date(dateVal);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Review Booking Request</h2>
                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                
                <div className="booking-info" style={{ marginBottom: '1.5rem' }}>
                    <p><strong>Resource:</strong> {booking.resourceId}</p>
                    <p><strong>Purpose:</strong> {booking.purpose}</p>
                    <p><strong>Time:</strong> {parseDateObj(booking.startTime).toLocaleString()} - {parseDateObj(booking.endTime).toLocaleString()}</p>
                    <p><strong>Attendees:</strong> {booking.expectedAttendees}</p>
                </div>
                
                <div className="form-group">
                    <label>Reason (required if rejecting)</label>
                    <textarea 
                        rows="3" 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)} 
                        placeholder="Why is this being rejected or approved?"
                    ></textarea>
                </div>

                <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                    <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                         <button type="button" className="btn-danger" onClick={() => handleReview('REJECTED')}>Reject</button>
                         <button type="button" className="btn-success" onClick={() => handleReview('APPROVED')}>Approve</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBookingReview;
