import React, { useState, useEffect } from 'react';
import { createBooking, updateBooking } from '../../api/booking.api';
import api from '../../utils/axiosConfig';
import './Bookings.css';

const BookingForm = ({ initialData, onClose, onRefresh }) => {
    const isEdit = !!initialData;
    const [formData, setFormData] = useState({
        resourceId: initialData?.resourceId || '',
        startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : '',
        endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : '',
        purpose: initialData?.purpose || '',
        expectedAttendees: initialData?.expectedAttendees || ''
    });
    const [error, setError] = useState(null);
    const [resources, setResources] = useState([]);
    const [loadingResources, setLoadingResources] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await api.get('/resources');
                setResources(response.data);
                // If edit mode or already set, keep it, otherwise set default to first available
                if (!isEdit && response.data.length > 0 && !formData.resourceId) {
                    setFormData(prev => ({ ...prev, resourceId: response.data[0].id }));
                }
            } catch (err) {
                console.error('Failed to load resources for dropdown', err);
            } finally {
                setLoadingResources(false);
            }
        };
        fetchResources();
    }, [isEdit, formData.resourceId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateBooking(initialData.id, formData);
            } else {
                await createBooking(formData);
            }
            onRefresh();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{isEdit ? 'Edit Booking' : 'Request a Booking'}</h2>
                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Resource / Facility</label>
                        {loadingResources ? (
                            <p style={{fontSize:'0.85rem', color:'#6b7280'}}>Loading available resources...</p>
                        ) : (
                            <select name="resourceId" value={formData.resourceId} onChange={handleChange} required>
                                {resources.length === 0 ? (
                                    <option value="" disabled>No resources available</option>
                                ) : (
                                    resources.map(res => (
                                        <option key={res.id} value={res.id}>
                                            {res.name} ({res.location || res.type})
                                        </option>
                                    ))
                                )}
                            </select>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label>Start Time</label>
                        <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} required />
                    </div>
                    
                    <div className="form-group">
                        <label>End Time</label>
                        <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required />
                    </div>
                    
                    <div className="form-group">
                        <label>Purpose</label>
                        <textarea name="purpose" rows="3" value={formData.purpose} onChange={handleChange} required></textarea>
                    </div>

                    <div className="form-group">
                        <label>Expected Attendees</label>
                        <input type="number" name="expectedAttendees" value={formData.expectedAttendees} onChange={handleChange} min="1" />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;
