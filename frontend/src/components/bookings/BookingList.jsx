import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus, deleteBooking } from '../../api/booking.api';
import api from '../../utils/axiosConfig';
import './Bookings.css';

const BookingList = ({ onEdit, onReview, isAdmin, statusFilter, currentUser }) => {
    const [bookings, setBookings] = useState([]);
    const [resources, setResources] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const init = async () => {
             await fetchResources();
             await fetchBookings();
        };
        init();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await api.get('/resources');
            const resourceMap = {};
            response.data.forEach(res => {
                resourceMap[res.id] = `${res.name} (${res.location || res.type})`;
            });
            setResources(resourceMap);
        } catch (err) {
            console.error("Failed to fetch resources catalog", err);
        }
    };

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

    const handleDelete = async (booking) => {
        if (!window.confirm("Are you absolutely sure you want to DELETE this booking? This cannot be undone.")) return;
        try {
            await deleteBooking(booking.id);
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting booking');
        }
    };

    const isFuture = (dateStr) => new Date(dateStr) > new Date();

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
                            <h3>Resource: {resources[booking.resourceId] || booking.resourceId}</h3>
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
                            {/* ANY user can Edit/Cancel their OWN pending bookings IF it's in the future */}
                            {booking.status === 'PENDING' && currentUser?.id === booking.userId && isFuture(booking.startTime) && (
                                <button className="btn-primary" onClick={() => onEdit(booking)}>Edit</button>
                            )}
                            {(booking.status === 'PENDING' || booking.status === 'APPROVED') && currentUser?.id === booking.userId && isFuture(booking.startTime) && (
                                <button className="btn-ghost" style={{color: '#f59e0b', borderColor: '#f59e0b'}} onClick={() => handleCancel(booking)}>Cancel</button>
                            )}
                            
                            {/* Deleting completely - Only for Terminal statuses to keep DB clean */}
                            {(booking.status === 'REJECTED' || booking.status === 'CANCELLED') && (currentUser?.id === booking.userId || isAdmin) && (
                                <button className="btn-ghost" style={{color: 'white', backgroundColor: '#ef4444', borderColor: '#ef4444'}} onClick={() => handleDelete(booking)}>Delete</button>
                            )}

                            {/* Admins can review PENDING bookings from OTHER users */}
                            {booking.status === 'PENDING' && isAdmin && currentUser?.id !== booking.userId && isFuture(booking.startTime) && (
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
