import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus } from '../../api/booking.api';
import './Bookings.css';

const BookingList = ({ onEdit, onReview, isAdmin, statusFilter }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await getBookings();
            setBookings(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (booking) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await updateBookingStatus(booking.id, { status: "CANCELLED" });
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Error cancelling booking');
        }
    };

    if (loading) return <div>Loading bookings...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

    const filteredBookings = bookings.filter(b => 
        statusFilter === 'ALL' || b.status === statusFilter
    );

    return (
        <div className="booking-grid">
            {filteredBookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                filteredBookings.map(booking => (
                    <div className="booking-card" key={booking.id}>
                        <span className={`status-badge status-${booking.status}`}>
                            {booking.status}
                        </span>
                        <div className="booking-info">
                            <h3>Resource: {booking.resourceId}</h3>
                            <p><strong>Purpose:</strong> {booking.purpose}</p>
                            <p><strong>From:</strong> {formatDate(booking.startTime)}</p>
                            <p><strong>To:</strong> {formatDate(booking.endTime)}</p>
                            <p><strong>Attendees:</strong> {booking.expectedAttendees || 'N/A'}</p>
                            {booking.adminReason && (
                                <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                    <strong>Admin Reason:</strong> {booking.adminReason}
                                </p>
                            )}
                        </div>
                        
                        <div className="booking-actions">
                            {booking.status === 'PENDING' && !isAdmin && (
                                <button className="btn-primary" onClick={() => onEdit(booking)}>Edit</button>
                            )}
                            {(booking.status === 'PENDING' || booking.status === 'APPROVED') && !isAdmin && (
                                <button className="btn-ghost" style={{color: 'red', borderColor: 'red'}} onClick={() => handleCancel(booking)}>Cancel</button>
                            )}
                            {booking.status === 'PENDING' && isAdmin && (
                                <button className="btn-primary" onClick={() => onReview(booking)}>Review</button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default BookingList;
