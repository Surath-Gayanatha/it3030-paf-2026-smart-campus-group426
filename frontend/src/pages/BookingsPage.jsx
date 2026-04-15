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
                <button className="btn-primary" onClick={handleCreateNew}>
                    + Request Booking
                </button>
            </div>

            <BookingList 
                key={refreshKey}
                isAdmin={isAdmin} 
                onEdit={handleEdit} 
                onReview={handleReview} 
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
