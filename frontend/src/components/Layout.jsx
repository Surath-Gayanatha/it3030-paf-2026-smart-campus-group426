import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Ticket } from 'lucide-react';

const Layout = () => {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <LayoutDashboard size={28} color="var(--primary-accent)" />
          <span style={{ fontSize: '1.2rem', letterSpacing: '-0.5px' }}>Smart Campus</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            Resources
          </NavLink>
          
          <NavLink 
            to="/tickets" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Ticket size={20} />
            Tickets
          </NavLink>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
