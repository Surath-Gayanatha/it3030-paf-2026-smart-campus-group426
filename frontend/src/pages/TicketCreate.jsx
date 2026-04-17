import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, Mail, Phone, User, Info, MapPin, Tag, X, Ticket, AlertTriangle } from 'lucide-react';
import API from '../api/api';

const TicketCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    resourceLocation: '',
    category: 'IT_EQUIPMENT',
    priority: 'MEDIUM',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [images, setImages] = useState([]);       // actual File objects
  const [previews, setPreviews] = useState([]);   // blob preview URLs
  const [errors, setErrors] = useState({});
  const [uploadBoxActive, setUploadBoxActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [imageUploadWarning, setImageUploadWarning] = useState('');

  // Revoke blob URLs when component unmounts or previews change
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const validate = () => {
    const newErrors = {};

    if (!formData.resourceLocation.trim()) {
      newErrors.resourceLocation = "Location is required.";
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address.";
    }

    const phoneRegex = /^\d{10,15}$/;
    if (formData.contactPhone && !phoneRegex.test(formData.contactPhone)) {
      newErrors.contactPhone = "Phone must be 10–15 digits (numbers only).";
    }

    if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setImageUploadWarning('');

    try {
      // ── Step 1: Create the ticket ──────────────────────────────────────────
      const res = await API.post('/tickets', formData);
      const ticket = res.data;
      const ticketId = ticket.id;

      // ── Step 2: Upload images (best-effort — ticket is already saved) ──────
      if (images.length > 0) {
        try {
          const payload = new FormData();
          images.forEach(file => payload.append('images', file));
          const imgRes = await API.post(`/tickets/${ticketId}/images`, payload);
          // Merge updated imageUrls back into ticket data
          ticket.imageUrls = imgRes.data?.imageUrls || ticket.imageUrls;
        } catch (imgErr) {
          const msg = imgErr.response?.data?.message || imgErr.message;
          console.warn('Image upload failed (ticket still saved):', msg);
          setImageUploadWarning(`Ticket created! Images could not be uploaded: ${msg}`);
        }
      }

      // ── Success ─────────────────────────────────────────────────────────────
      previews.forEach(url => URL.revokeObjectURL(url));
      setSubmittedTicket(ticket);
      setSubmitSuccess(true);
      setTimeout(() => navigate('/tickets'), 4000);
    } catch (err) {
      // Ticket creation itself failed
      const msg = err.response?.data?.message || err.message || 'Network Error';
      console.error('Ticket creation error:', msg);
      setErrors({ submit: `Submission failed: ${msg}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Core file processing — shared by drag-drop and file input
  const processFiles = (files) => {
    const validFiles = [];
    const tooLarge = [];

    files.forEach(file => {
      if (file.size / 1024 / 1024 < 2) {
        validFiles.push(file);
      } else {
        tooLarge.push(file.name);
      }
    });

    if (tooLarge.length > 0) {
      alert(`These images exceed 2MB: ${tooLarge.join(', ')}`);
    }

    if (validFiles.length === 0) return;

    setImages(prev => {
      const slots = 3 - prev.length;
      if (slots <= 0) {
        alert("Maximum 3 images allowed.");
        return prev;
      }
      const toAdd = validFiles.slice(0, slots);
      const newImages = [...prev, ...toAdd];

      // Build fresh preview URLs only for new files
      const newPreviews = newImages.map(f => URL.createObjectURL(f));
      // Revoke old previews before replacing
      setPreviews(old => {
        old.forEach(url => URL.revokeObjectURL(url));
        return newPreviews;
      });

      return newImages;
    });
  };

  // Drag-and-drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    setUploadBoxActive(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  // File <input> handler
  const handleFileInput = (e) => {
    processFiles(Array.from(e.target.files));
    // Reset input so the same file can be re-selected after removal
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      setPreviews(old => {
        URL.revokeObjectURL(old[index]);
        return next.map(f => URL.createObjectURL(f));
      });
      return next;
    });
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', position: 'relative' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 800 }}>Create New Ticket</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          Submit your request below. Our team will review and prioritize it shortly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '40px' }}>

        {/* Submission Error Display */}
        {errors.submit && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#B91C1C'
          }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 600 }}>{errors.submit}</span>
          </div>
        )}

        {/* Location + Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--primary-accent)" /> Resource / Location
            </label>
            <input
              required
              type="text"
              className="premium-input"
              placeholder="e.g. Lab 402, Building A"
              style={{ borderColor: errors.resourceLocation ? 'var(--priority-critical)' : '' }}
              value={formData.resourceLocation}
              onChange={e => setFormData({ ...formData, resourceLocation: e.target.value })}
            />
            {errors.resourceLocation && (
              <span style={{ color: 'var(--priority-critical)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                {errors.resourceLocation}
              </span>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} color="var(--primary-accent)" /> Category
            </label>
            <select
              className="premium-input"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="IT_EQUIPMENT">IT Equipment</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="HVAC">HVAC</option>
              <option value="FURNITURE">Furniture</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} color="var(--secondary-accent)" /> Description
          </label>
          <textarea
            required
            className="premium-input"
            rows="4"
            placeholder="Briefly explain the issue (minimum 10 characters)…"
            style={{ borderColor: errors.description ? 'var(--priority-critical)' : '' }}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
          {errors.description && (
            <span style={{ color: 'var(--priority-critical)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
              {errors.description}
            </span>
          )}
        </div>

        {/* Requester Information */}
        <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 20px 0', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--primary-accent)" /> Requester Information
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Full Name</label>
              <input
                required
                type="text"
                className="premium-input"
                placeholder="John Doe"
                style={{ borderColor: errors.contactName ? 'var(--priority-critical)' : '' }}
                value={formData.contactName}
                onChange={e => setFormData({ ...formData, contactName: e.target.value })}
              />
              {errors.contactName && (
                <span style={{ color: 'var(--priority-critical)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  {errors.contactName}
                </span>
              )}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  required
                  type="email"
                  className="premium-input"
                  placeholder="john@university.edu"
                  style={{ paddingLeft: '44px', borderColor: errors.contactEmail ? 'var(--priority-critical)' : '' }}
                  value={formData.contactEmail}
                  onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              {errors.contactEmail && (
                <span style={{ color: 'var(--priority-critical)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  {errors.contactEmail}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Phone Number (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="premium-input"
                  placeholder="e.g. 0771234567"
                  style={{ paddingLeft: '44px', borderColor: errors.contactPhone ? 'var(--priority-critical)' : '' }}
                  value={formData.contactPhone}
                  onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
              {errors.contactPhone && (
                <span style={{ color: 'var(--priority-critical)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  {errors.contactPhone}
                </span>
              )}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Priority</label>
              <select
                className="premium-input"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={16} color="var(--primary-accent)" /> Image Proof
          </label>

          <div
            style={{
              border: `2px dashed ${uploadBoxActive ? 'var(--primary-accent)' : '#CBD5E1'}`,
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              background: uploadBoxActive ? '#EEF2FF' : '#F8FAFC',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onDragOver={(e) => { e.preventDefault(); setUploadBoxActive(true); }}
            onDragLeave={() => setUploadBoxActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Hidden file input — NOT inside the drag zone visually */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <UploadCloud size={32} color={uploadBoxActive ? 'var(--primary-accent)' : '#64748B'} style={{ marginBottom: '12px' }} />
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
              Drag and drop images here, or click to browse
            </p>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} color="#10B981" /> Max 3 images
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} color="#10B981" /> Max 2MB per image
              </span>
            </div>
          </div>

          {/* Image previews */}
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 12px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <img
                    src={previews[i]}
                    alt="preview"
                    style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {img.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 800, padding: '0 2px', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate('/tickets')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="premium-btn"
            disabled={isSubmitting}
            style={{ padding: '12px 32px', minWidth: '180px' }}
          >
            {isSubmitting ? 'Submitting…' : 'Complete Submission'}
          </button>
        </div>

      </form>

      {/* ── Success Overlay ── */}
      {submitSuccess && submittedTicket && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '480px', padding: '40px', textAlign: 'center', background: '#FFFFFF' }}>
            <div style={{ background: '#D1FAE5', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <CheckCircle size={40} color="#10B981" />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>Successfully Submitted!</h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem', marginBottom: '24px' }}>
              Your ticket <strong style={{ color: '#0F172A' }}>#{submittedTicket.id.slice(-5)}</strong> has been received and is now in our system.
            </p>

            {imageUploadWarning && (
              <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', textAlign: 'left', marginBottom: '24px' }}>
                <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#92400E', fontSize: '0.95rem' }}>Images Pending</h4>
                  <p style={{ margin: 0, color: '#B45309', fontSize: '0.85rem' }}>{imageUploadWarning}</p>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left', background: '#F8FAFC', padding: '20px', borderRadius: '12px', marginBottom: '32px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '4px' }}>CATEGORY</span>
                <span style={{ color: '#334155', fontWeight: 600, fontSize: '0.9rem' }}>{submittedTicket.category.replace('_', ' ')}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '4px' }}>PRIORITY</span>
                <span style={{ color: '#334155', fontWeight: 600, fontSize: '0.9rem' }}>{submittedTicket.priority}</span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #CBD5E1', borderTopColor: 'var(--primary-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Redirecting to your tickets…
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketCreate;