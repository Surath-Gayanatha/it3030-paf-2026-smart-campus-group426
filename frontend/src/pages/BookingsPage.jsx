import React, { useState } from 'react';
import BookingList from '../components/bookings/BookingList';
import BookingForm from '../components/bookings/BookingForm';
import AdminBookingReview from '../components/bookings/AdminBookingReview';
import { useAuth } from '../context/AuthContext';
import '../components/bookings/Bookings.css';

const BookingsPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [showForm, setShowForm] = useState(false);
    const [editBooking, setEditBooking] = useState(null);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Using a key trick to force the BookingList component to remount and fetch fresh data
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = () => setRefreshKey(prev => prev + 1);

    const handleCreateNew = () => {
        setEditBooking(null);
        setShowForm(true);
    };

    const handleEdit = (booking) => {
        setEditBooking(booking);
        setShowForm(true);
    };

    const handleReview = (booking) => {
        setReviewBooking(booking);
    };

    return (
        <div className="booking-container">
            <div className="booking-header">
                <div>
                    <h1>Facility Bookings</h1>
                    <p style={{color: '#6b7280', marginTop: '0.5rem'}}>Manage and track resource reservations</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button className="btn-primary" onClick={handleCreateNew}>
                        + Request Booking
                    </button>
                </div>
            </div>

            <BookingList 
                key={refreshKey}
                isAdmin={isAdmin} 
                currentUser={user}
                onEdit={handleEdit} 
                onReview={handleReview} 
                statusFilter={statusFilter}
            />

            {showForm && (
                <BookingForm 
                    initialData={editBooking}
                    onClose={() => setShowForm(false)}
                    onRefresh={triggerRefresh}
                />
            )}

            {reviewBooking && (
                <AdminBookingReview 
                    booking={reviewBooking}
                    onClose={() => setReviewBooking(null)}
                    onRefresh={triggerRefresh}
                />
            )}
        </div>
    );
};

export default BookingsPage;
