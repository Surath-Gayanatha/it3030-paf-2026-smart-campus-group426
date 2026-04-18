import { Link, Navigate } from 'react-router-dom';
import ResourceForm from '../components/Resources/ResourceForm';
import { useAuth } from '../context/AuthContext';
import './Resources.css';

const highlights = [
  'Publish lecture halls, labs, rooms, and equipment in one place.',
  'Upload an image from your desktop or attach an image URL.',
  'Keep the public facilities page clean while admins or staff add entries separately.',
];

const AddFacility = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="route-loading">Loading...</div>;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="resources-page facility-create-page">
      <section className="facility-create-hero">
        <div className="container facility-create-hero__layout">
          <div className="facility-create-hero__copy">
            <p className="section-label">Create Facility</p>
            <h1>Add a new campus facility with a focused, easy-to-use form.</h1>
            <p>
              Use this page to register a new space or asset. The main catalogue stays dedicated to browsing, while this page handles creation and image upload.
            </p>
            <div className="facility-create-hero__links">
              <Link to="/resources" className="btn-secondary">Back to facilities</Link>
            </div>
          </div>

          <div className="facility-create-hero__panel">
            <h2>Before you submit</h2>
            <ul>
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <main className="container facility-create-layout">
        <ResourceForm />
      </main>
    </div>
  );
};

export default AddFacility;
