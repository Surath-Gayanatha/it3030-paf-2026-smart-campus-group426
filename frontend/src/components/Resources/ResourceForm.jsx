import { useState } from 'react';
import api from '../../utils/axiosConfig';

const initialFormState = {
  name: '',
  type: 'Lecture Hall',
  capacity: '',
  location: '',
  description: '',
  imageUrl: '',
  status: 'ACTIVE',
};

const resourceTypes = [
  'Lecture Hall',
  'Lab',
  'Meeting Room',
  'Equipment',
  'Auditorium',
  'Studio',
];

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Out of service', value: 'OUT_OF_SERVICE' },
];

const ResourceForm = ({ onCreated }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        availabilityWindows: [],
      };

      await api.post('/resources', payload);
      setFormData(initialFormState);
      setMessage('Facility added successfully.');
      if (onCreated) {
        onCreated();
      }
    } catch (submissionError) {
      setError('Unable to add the facility right now. Please check the form and try again.');
      console.error('Error creating resource:', submissionError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="facility-form-card">
      <div className="facility-form-card__header">
        <div>
          <p className="section-label">Add Facility</p>
          <h2>Publish a new campus space</h2>
        </div>
        <p className="facility-form-card__hint">
          Provide a name, image, and short description so students can quickly understand the facility.
        </p>
      </div>

      <form className="facility-form" onSubmit={handleSubmit}>
        <div className="facility-form__grid">
          <label className="facility-form__field">
            <span>Facility name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="North Wing Lecture Hall"
              required
            />
          </label>

          <label className="facility-form__field">
            <span>Type</span>
            <select name="type" value={formData.type} onChange={handleChange} required>
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="facility-form__field">
            <span>Capacity</span>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="120"
              min="1"
              required
            />
          </label>

          <label className="facility-form__field">
            <span>Status</span>
            <select name="status" value={formData.status} onChange={handleChange} required>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="facility-form__field facility-form__field--full">
            <span>Location</span>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Main Block, Level 3"
              required
            />
          </label>

          <label className="facility-form__field facility-form__field--full">
            <span>Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the experience, equipment, or special features."
              rows="4"
              required
            />
          </label>

          <label className="facility-form__field facility-form__field--full">
            <span>Image URL</span>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              required
            />
          </label>
        </div>

        {message && <div className="facility-form__alert facility-form__alert--success">{message}</div>}
        {error && <div className="facility-form__alert facility-form__alert--error">{error}</div>}

        <button type="submit" className="facility-form__submit" disabled={submitting}>
          {submitting ? 'Publishing...' : 'Add facility to catalogue'}
        </button>
      </form>
    </section>
  );
};

export default ResourceForm;
