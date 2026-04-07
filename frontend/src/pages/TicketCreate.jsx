import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, Mail, Phone, User, AlertCircle, Info, MapPin, Tag } from 'lucide-react';
import API from '../api/api';

const TicketCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    resourceLocation: '',
    category: 'IT_EQUIPMENT',
    priority: 'MEDIUM',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [uploadBoxActive, setUploadBoxActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    // Email Validation (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address.";
    }

    // Phone Validation (10-15 digits)
    const phoneRegex = /^\d{10,15}$/;
    if (formData.contactPhone && !phoneRegex.test(formData.contactPhone)) {
      newErrors.contactPhone = "Phone must be 10-15 digits (numbers only).";
    }

    // Description length (already on backend, but good for UX)
    if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);

    try {
      // Step 1: Create ticket
      const res = await API.post('/tickets', formData);
      const ticketId = res.data.id;

      // Step 2: Upload images separately if any
      if (images.length > 0) {
        const payload = new FormData();
        images.forEach(file => payload.append('images', file));

        await API.post(`/tickets/${ticketId}/images`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/tickets');
    } catch (err) {
      console.error("Error response:", err.response?.data);
      alert(`Submission Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setUploadBoxActive(false);
    const files = Array.from(e.dataTransfer ? e.dataTransfer.files : e.target.files);
    
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
      alert(`Following images are too large (>2MB): ${tooLarge.join(', ')}`);
    }

    if (images.length + validFiles.length <= 3) {
      setImages(prev => [...prev, ...validFiles]);
    } else {
      alert("Maximum 3 images allowed.");
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 800 }}>Create New Ticket</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          Submit your request below. Our team will review and prioritize it shortly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '40px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--primary-accent)" /> Resource / Location
            </label>
            <input required type="text" className="premium-input" placeholder="e.g. Lab 402, Building A"
              value={formData.resourceLocation} onChange={e => setFormData({ ...formData, resourceLocation: e.target.value })} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} color="var(--primary-accent)" /> Category
            </label>
            <select className="premium-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option value="IT_EQUIPMENT">IT Equipment</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="HVAC">HVAC</option>
              <option value="FURNITURE">Furniture</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} color="var(--secondary-accent)" /> Description
          </label>
          <textarea required className="premium-input" rows="4" placeholder="Briefly explain the issue (minimum 10 chars)..."
            style={{ borderColor: errors.description ? 'var(--priority-critical)' : '' }}
            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
          {errors.description && <span style={{ color: 'var(--priority-critical)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.description}</span>}
        </div>

        <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 20px 0', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--primary-accent)" /> Requester Information
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input required type="text" className="premium-input" placeholder="John Doe"
                  value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input required type="email" className="premium-input" placeholder="john@university.edu"
                  style={{ paddingLeft: '44px', borderColor: errors.contactEmail ? 'var(--priority-critical)' : '' }}
                  value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
              </div>
              {errors.contactEmail && <span style={{ color: 'var(--priority-critical)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.contactEmail}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Phone Number (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="premium-input" placeholder="e.g. 0771234567"
                  style={{ paddingLeft: '44px', borderColor: errors.contactPhone ? 'var(--priority-critical)' : '' }}
                  value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
              </div>
              {errors.contactPhone && <span style={{ color: 'var(--priority-critical)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.contactPhone}</span>}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Priority</label>
              <select className="premium-input" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={16} color="var(--primary-accent)" /> Image Proof
          </label>
          <div
            style={{
              border: `2px dashed ${uploadBoxActive ? 'var(--primary-accent)' : '#CBD5E1'}`,
              borderRadius: '12px', padding: '32px', textAlign: 'center',
              background: uploadBoxActive ? '#EEF2FF' : '#F8FAFC',
              cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative'
            }}
            onDragOver={(e) => { e.preventDefault(); setUploadBoxActive(true); }}
            onDragLeave={() => setUploadBoxActive(false)}
            onDrop={handleFileDrop}
          >
            <input type="file" multiple accept="image/*"
              onChange={handleFileDrop}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
            <UploadCloud size={32} color={uploadBoxActive ? 'var(--primary-accent)' : '#64748B'} style={{ marginBottom: '12px' }} />
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>Drag and drop images here</p>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} color="#10B981" /> Max 3 images</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} color="#10B981" /> Max 2MB per image</span>
            </div>
          </div>

          {images.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <div key={i} style={{ padding: '8px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <img src={URL.createObjectURL(img)} alt="preview" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.name}</span>
                  <button type="button" onClick={() => removeImage(i)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 800 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button type="button" className="secondary-btn" onClick={() => navigate('/tickets')} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="premium-btn" disabled={isSubmitting} style={{ padding: '12px 32px' }}>
            {isSubmitting ? 'Processing...' : 'Complete Submission'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default TicketCreate;