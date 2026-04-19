import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus, deleteBooking } from '../../api/booking.api';
import api from '../../utils/axiosConfig';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';
import LiveTimer from './LiveTimer';
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

    const parseDateObj = (dateVal) => {
        if (!dateVal) return new Date();
        if (Array.isArray(dateVal)) {
            return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0);
        }
        return new Date(dateVal);
    };

    const isFuture = (dateStr) => parseDateObj(dateStr) > new Date();
    const isNotExpired = (dateStr) => parseDateObj(dateStr) >= new Date();

    const handleDownloadPass = (booking) => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(34, 197, 94);
        doc.text("Official Booking Pass", 20, 20);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text(`Booking ID: ${booking.id}`, 20, 35);
        doc.text(`Resource: ${resources[booking.resourceId] || booking.resourceId}`, 20, 45);
        doc.text(`Purpose: ${booking.purpose}`, 20, 55);
        doc.text(`Attendees: ${booking.expectedAttendees || 'N/A'}`, 20, 65);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`From: ${parseDateObj(booking.startTime).toLocaleString()}`, 20, 80);
        doc.text(`To: ${parseDateObj(booking.endTime).toLocaleString()}`, 20, 90);
        
        const canvas = document.getElementById(`qr-${booking.id}`);
        if (canvas) {
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 140, 20, 50, 50);
        }
        
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Smart Campus Operations Hub - Secure Gateway Pass", 20, 280);

        doc.save(`GatePass_${booking.id}.pdf`);
    };

    if (loading) return <div>Loading bookings...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const formatDate = (dateStr) => parseDateObj(dateStr).toLocaleString();

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
                            
                            {isAdmin && booking.requesterName && (
                                <div style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Requester:</strong> {booking.requesterName} <span style={{fontSize: '0.8rem', color: '#6b7280'}}>({booking.requesterRole})</span></p>
                                    <p style={{ margin: '0', fontSize: '0.85rem' }}><strong>Email:</strong> {booking.requesterEmail}</p>
                                </div>
                            )}

                            <p><strong>Purpose:</strong> {booking.purpose}</p>
                            <p><strong>From:</strong> {formatDate(booking.startTime)}</p>
                            <p><strong>To:</strong> {formatDate(booking.endTime)}</p>
                            <p><strong>Attendees:</strong> {booking.expectedAttendees || 'N/A'}</p>
                            
                            {booking.status === 'APPROVED' && (
                                <LiveTimer startTime={booking.startTime} endTime={booking.endTime} />
                            )}

                            <div style={{ display: 'none' }}>
                                <QRCodeCanvas id={`qr-${booking.id}`} value={`SECURE-PASS:${booking.id}`} size={256} />
                            </div>

                            {booking.adminReason && (
                                <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                    <strong>Admin Reason:</strong> {booking.adminReason}
                                </p>
                            )}
                        </div>
                        
                        <div className="booking-actions">
                            {/* ANY user can Edit/Cancel their OWN pending bookings at any time to fix them, or cancel any that aren't fully expired yet */}
                            {booking.status === 'PENDING' && currentUser?.id === booking.userId && (
                                <button className="btn-primary" onClick={() => onEdit(booking)}>Edit</button>
                            )}
                            {((booking.status === 'PENDING') || (booking.status === 'APPROVED' && isNotExpired(booking.endTime))) && currentUser?.id === booking.userId && (
                                <button className="btn-ghost" style={{color: '#f59e0b', borderColor: '#f59e0b'}} onClick={() => handleCancel(booking)}>Cancel</button>
                            )}
                            
                            {booking.status === 'APPROVED' && (
                                <button className="btn-primary" style={{backgroundColor: '#10b981', borderColor: '#10b981'}} onClick={() => handleDownloadPass(booking)}>Download Pass</button>
                            )}

                            {/* Deleting completely - Only for Terminal statuses to keep DB clean */}
                            {(booking.status === 'REJECTED' || booking.status === 'CANCELLED') && (currentUser?.id === booking.userId || isAdmin) && (
                                <button className="btn-ghost" style={{color: 'white', backgroundColor: '#ef4444', borderColor: '#ef4444'}} onClick={() => handleDelete(booking)}>Delete</button>
                            )}

                            {/* Admins can ALWAYS review PENDING bookings from OTHER users, even if the user incorrectly booked a close-to-past time */}
                            {booking.status === 'PENDING' && isAdmin && currentUser?.id !== booking.userId && (
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
