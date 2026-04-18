import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

const checklist = [
  {
    title: 'Verified access',
    description: 'Only approved campus admins can continue to the facility creation form.',
  },
  {
    title: 'One sign-in flow',
    description: 'Use the Google account tied to your admin role to unlock the page.',
  },
  {
    title: 'Straight through',
    description: 'After successful admin sign-in, you are sent directly to Add Facility.',
  },
];

const AdminLogin = () => {
  const { user, loading, login } = useAuth();

  if (loading) {
    return <div className="route-loading">Loading...</div>;
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <section className="admin-login-page">
      <div className="admin-login-page__ambient admin-login-page__ambient--one" aria-hidden="true" />
      <div className="admin-login-page__ambient admin-login-page__ambient--two" aria-hidden="true" />

      <div className="container admin-login-page__layout">
        <div className="admin-login-page__copy">
          <p className="section-label">Admin Access</p>
          <h1>Open the facility form with an admin account.</h1>
          <p className="admin-login-page__lede">
            Clicking Add Facility now brings you here first. That keeps the creation flow behind an admin sign-in while leaving the public catalogue unchanged.
          </p>

          <div className="admin-login-page__checklist">
            {checklist.map((item) => (
              <article className="admin-login-page__checklist-item" key={item.title}>
                <span className="admin-login-page__checklist-marker" aria-hidden="true" />
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-login-page__panel">
          <div className="admin-login-page__badge">
            <span className="admin-login-page__badge-dot" aria-hidden="true" />
            Secure admin entry
          </div>

          <h2>Admin Login</h2>

          {isAdmin ? (
            <>
              <p className="admin-login-page__panel-copy">
                You are already signed in as <strong>{user.name || user.email}</strong>. Continue to the facility form when you are ready.
              </p>
              <Link to="/facilities/create" className="btn-primary admin-login-page__action">
                Go to add facility
              </Link>
            </>
          ) : (
            <>
              <p className="admin-login-page__panel-copy">
                Use the approved Google account linked to the campus admin role to unlock facility creation.
              </p>

              <button type="button" className="btn-primary admin-login-page__action" onClick={() => login('/facilities/create')}>
                <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className="admin-login-page__status">
                <strong>Need the admin account?</strong>
                {user ? (
                  <span>
                    Signed in as {user.name || user.email}, but this account does not have admin access.
                  </span>
                ) : (
                  <span>Sign in with the campus administrator account to continue.</span>
                )}
              </div>
            </>
          )}

          <div className="admin-login-page__footer">
            <span>Prefer browsing the catalogue first?</span>
            <Link to="/resources" className="btn-secondary">
              Back to facilities
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;