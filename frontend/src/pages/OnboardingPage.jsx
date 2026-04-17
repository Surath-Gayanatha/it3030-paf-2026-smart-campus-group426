import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState('LECTURER');
  const [selectedTechCategory, setSelectedTechCategory] = useState('IT_EQUIPMENT');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.onboardingCompleted !== false) {
      navigate('/', { replace: true });
    }
  }, [navigate, user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const submitRoleRequest = async () => {
    setSubmitting(true);
    setError('');

    try {
      await api.post('/auth/me/role-request', null, {
        params: { role: selectedRole, techCategory: selectedTechCategory },
      });
      await refreshUser();
      navigate('/', { replace: true });
    } catch (requestError) {
      setError('Unable to submit role request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const continueAsUser = async () => {
    setSubmitting(true);
    setError('');

    try {
      await api.post('/auth/me/onboarding/complete');
      await refreshUser();
      navigate('/', { replace: true });
    } catch (requestError) {
      setError('Unable to complete onboarding. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="onboarding-page">
      <div className="container onboarding-card">
        <h1>Welcome to Smart Campus</h1>
        <p>
          Choose your role request if needed. Admin approval is required for LECTURER and TECHNICIAN access.
        </p>

        <div className="onboarding-role-grid">
          <button
            type="button"
            className={`onboarding-role${selectedRole === 'LECTURER' ? ' onboarding-role--active' : ''}`}
            onClick={() => setSelectedRole('LECTURER')}
          >
            <h3>LECTURER</h3>
            <span>Request classroom and academic management permissions.</span>
          </button>

          <button
            type="button"
            type="button"
            className={`onboarding-role${selectedRole === 'TECHNICIAN' ? ' onboarding-role--active' : ''}`}
            onClick={() => setSelectedRole('TECHNICIAN')}
          >
            <h3>TECHNICIAN</h3>
            <span>Request maintenance and ticket resolution permissions.</span>
          </button>
        </div>

        {selectedRole === 'TECHNICIAN' && (
          <div className="onboarding-tech-category">
            <label htmlFor="techCategory">Select Technician Category:</label>
            <select
              id="techCategory"
              value={selectedTechCategory}
              onChange={(e) => setSelectedTechCategory(e.target.value)}
              className="admin-select"
            >
              <option value="IT_EQUIPMENT">IT Equipment</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="HVAC">HVAC</option>
              <option value="FURNITURE">Furniture</option>
            </select>
          </div>
        )}

        {error && <p className="onboarding-error">{error}</p>}

        <div className="onboarding-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={submitRoleRequest} disabled={submitting}>
            {submitting ? 'Submitting...' : `Request ${selectedRole} Role`}
          </button>
          <button type="button" className="admin-btn" onClick={continueAsUser} disabled={submitting}>
            Continue as USER
          </button>
        </div>
      </div>
    </section>
  );
};

export default OnboardingPage;
