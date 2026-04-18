import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const { user, login, logout } = useAuth();

  const navLinks = useMemo(() => [
    { label: 'Home', href: '/', active: true },
    { label: 'Facilities', href: '/resources' },
    { label: 'Add Facility', href: '/admin-login' },
    { label: 'Bookings', href: '#bookings' },
    { label: 'Tickets', href: '#dashboard' },
    { label: 'Dashboard', href: '#dashboard' },
  ], []);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SC';

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__inner">
        {/* Brand */}
        <a href="/" className="navbar__brand" id="navbar-brand">
          <div className="navbar__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="navbar__title">
            Smart Campus Operations Hub
            <span>University Management System</span>
          </div>
        </a>

        {/* Nav Links */}
        <ul className="navbar__nav" role="menubar">
          {navLinks.map((link) => (
            <li key={link.label} role="none">
              <a
                href={link.href}
                className={`nav-link${link.active ? ' active' : ''}`}
                role="menuitem"
                id={`nav-${link.label.toLowerCase()}`}
                aria-current={link.active ? 'page' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          {user ? (
            <>
              <NotificationBell />

              <div className="profile">
                <button
                  type="button"
                  className="profile__trigger"
                  onClick={() => setOpenMenu((prev) => !prev)}
                >
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name || 'User'} className="profile__avatar" />
                  ) : (
                    <span className="profile__avatar profile__avatar--fallback">{initials}</span>
                  )}
                  <span className="profile__name">{user.name || user.email}</span>
                </button>

                {openMenu && (
                  <div className="profile__menu">
                    <div className="profile__menu-label">{user.email}</div>
                    {user.role === 'ADMIN' && (
                      <Link className="profile__menu-item" to="/admin" onClick={() => setOpenMenu(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <button
                      type="button"
                      className="profile__menu-item"
                      onClick={() => {
                        setOpenMenu(false);
                        logout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button onClick={login} className="btn-login" id="btn-google-login" type="button">
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
