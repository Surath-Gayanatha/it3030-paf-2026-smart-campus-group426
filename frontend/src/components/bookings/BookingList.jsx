import React, { useEffect, useState } from 'react';
import { getBookings } from '../../api/booking.api';
import './Bookings.css';

const BookingList = ({ onEdit, onReview, isAdmin }) => {
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

    if (loading) return <div>Loading bookings...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

    return (
        <div className="booking-grid">
            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                bookings.map(booking => (
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
