import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, Mail, Phone, User, Info, MapPin, Tag, X, AlertTriangle } from 'lucide-react';
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
      // Step 1: Create the ticket
      const res = await API.post('/tickets', formData);
      const ticket = res.data;
      const ticketId = ticket.id;

      // Step 2: Upload images (best-effort)
      if (images.length > 0) {
        try {
          const payload = new FormData();
          images.forEach(file => payload.append('images', file));
          const imgRes = await API.post(`/tickets/${ticketId}/images`, payload);
          ticket.imageUrls = imgRes.data?.imageUrls || ticket.imageUrls;
        } catch (imgErr) {
          const msg = imgErr.response?.data?.message || imgErr.message;
          console.warn('Image upload failed (ticket still saved):', msg);
          setImageUploadWarning(`Ticket created! Images could not be uploaded: ${msg}`);
        }
      }

      // Success
      previews.forEach(url => URL.revokeObjectURL(url));
      setSubmittedTicket(ticket);
      setSubmitSuccess(true);
      setTimeout(() => navigate('/tickets'), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Network Error';
      console.error('Ticket creation error:', msg);
      setErrors({ submit: `Submission failed: ${msg}` });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      const newPreviews = newImages.map(f => URL.createObjectURL(f));
      setPreviews(old => {
        old.forEach(url => URL.revokeObjectURL(url));
        return newPreviews;
      });
      return newImages;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setUploadBoxActive(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e) => {
    processFiles(Array.from(e.target.files));
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

  const styles = {
    container: {
      maxWidth: '920px',
      margin: '40px auto',
      padding: '0 24px',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#1E293B',
      animation: 'fadeIn 0.6s ease-out'
    },
    header: {
      marginBottom: '40px',
      textAlign: 'center'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '800',
      color: '#1E3A8A',
      margin: '0 0 12px 0',
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    },
    subtitle: {
      color: '#64748B',
      fontSize: '1.1rem',
      fontWeight: '500',
      maxWidth: '600px',
      margin: '0 auto'
    },
    form: {
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '24px',
      padding: '48px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    },
    group: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '0.95rem',
      fontWeight: '600',
      color: '#334155'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      borderRadius: '12px',
      border: '2px solid #E2E8F0',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      outline: 'none',
      backgroundColor: '#FFFFFF',
      color: '#1E293B'
    },
    section: {
      padding: '32px',
      background: '#F8FAFC',
      borderRadius: '20px',
      border: '1px solid #E2E8F0'
    },
    uploadZone: {
      border: '2px dashed #CBD5E1',
      borderRadius: '16px',
      padding: '40px 24px',
      textAlign: 'center',
      background: '#F8FAFC',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    },
    buttonPrimary: {
      background: '#2563EB',
      color: '#FFFFFF',
      padding: '14px 40px',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '700',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    buttonSecondary: {
      background: '#FFFFFF',
      color: '#475569',
      padding: '13px 40px',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      border: '1.5px solid #E2E8F0',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .premium-input:focus {
            border-color: #2563EB !important;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important;
          }
          .premium-btn:hover:not(:disabled) {
            background: #1D4ED8 !important;
            transform: translateY(-1px);
          }
          .secondary-btn:hover:not(:disabled) {
            background: #F8FAFC !important;
            border-color: #CBD5E1 !important;
            color: #1E293B !important;
          }
        `}
      </style>

      <div style={styles.header}>
        <h1 style={styles.title}>Create Support Request</h1>
        <p style={styles.subtitle}>
          Have an issue on campus? Submit a ticket and our technicians will resolve it for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {errors.submit && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '16px', borderRadius: '14px', display: 'flex', itemsCenter: 'center', gap: '12px', color: '#B91C1C' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 600 }}>{errors.submit}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={styles.group}>
            <label style={styles.label}><MapPin size={18} color="#2563EB" /> Location</label>
            <input required type="text" className="premium-input" placeholder="e.g. Building C, Room 102" style={{ ...styles.input, borderColor: errors.resourceLocation ? '#EF4444' : '#E2E8F0' }} value={formData.resourceLocation} onChange={e => setFormData({ ...formData, resourceLocation: e.target.value })} />
          </div>
          <div style={styles.group}>
            <label style={styles.label}><Tag size={18} color="#2563EB" /> Category</label>
            <select className="premium-input" style={styles.input} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option value="IT_EQUIPMENT">IT Equipment</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="HVAC">HVAC</option>
              <option value="FURNITURE">Furniture</option>
            </select>
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}><Info size={18} color="#2563EB" /> Detailed Description</label>
          <textarea required className="premium-input" rows="4" placeholder="Describe the issue (min 10 chars)..." style={{ ...styles.input, borderColor: errors.description ? '#EF4444' : '#E2E8F0', minHeight: '120px' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div style={styles.section}>
          <h4 style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: 700, color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} /> Requester Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={styles.group}>
              <label style={styles.label}>Full Name</label>
              <input required type="text" className="premium-input" placeholder="John Doe" style={styles.input} value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input required type="email" className="premium-input" placeholder="john@campus.edu" style={{ ...styles.input, paddingLeft: '48px' }} value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div style={styles.group}>
              <label style={styles.label}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="premium-input" placeholder="0771234567" style={{ ...styles.input, paddingLeft: '48px' }} value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
              </div>
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Priority</label>
              <select className="premium-input" style={styles.input} value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}><UploadCloud size={18} color="#2563EB" /> Image Proof (Optional)</label>
          <div style={{ ...styles.uploadZone, borderColor: uploadBoxActive ? '#2563EB' : '#CBD5E1', background: uploadBoxActive ? '#F0F7FF' : '#F8FAFC' }} onDragOver={(e) => { e.preventDefault(); setUploadBoxActive(true); }} onDragLeave={() => setUploadBoxActive(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileInput} style={{ display: 'none' }} />
            <UploadCloud size={32} color="#2563EB" />
            <p style={{ margin: 0, fontWeight: 600 }}>Click or drag images here</p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Max 3 files, 2MB each</p>
          </div>
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <div key={i} style={{ padding: '8px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={previews[i]} alt="preview" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#444' }}>{img.name}</span>
                  <button type="button" onClick={() => removeImage(i)} style={{ color: '#EF4444' }}><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="secondary-btn" style={styles.buttonSecondary} onClick={() => navigate('/tickets')} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="premium-btn" style={styles.buttonPrimary} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Complete Submission'}
          </button>
        </div>
      </form>

      {submitSuccess && submittedTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.4s ease-out' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '28px', width: '100%', maxWidth: '480px', padding: '48px 32px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#DCFCE7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px auto', color: '#16A34A' }}>
              <CheckCircle size={40} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Thank You!</h2>
            <p style={{ color: '#64748B', marginBottom: '32px' }}>Ticket <strong>#{submittedTicket.id.slice(-5).toUpperCase()}</strong> has been submitted.</p>
            <div style={{ display: 'flex', itemsCenter: 'center', justifyContent: 'center', gap: '12px', color: '#94A3B8' }}>
              <div style={{ width: '18px', height: '18px', border: '2px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Redirecting...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketCreate;