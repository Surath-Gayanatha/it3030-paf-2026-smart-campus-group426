import React from 'react';
import ResourceCatalog from '../components/Resources/ResourceCatalog';
import Footer from '../components/Footer';
import './Resources.css';

const Resources = () => {
  return (
    <div className="resources-page">
      <header className="page-header">
        <div className="container">
          <h1>Campus Resources</h1>
          <p>Explore and book available facilities, equipment, and spaces across the campus.</p>
        </div>
      </header>
      
      <main className="container">
        <ResourceCatalog />
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
