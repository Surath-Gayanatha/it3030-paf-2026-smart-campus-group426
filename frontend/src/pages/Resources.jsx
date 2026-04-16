import { useState } from 'react';
import ResourceCatalog from '../components/Resources/ResourceCatalog';
import ResourceForm from '../components/Resources/ResourceForm';
import Footer from '../components/Footer';
import './Resources.css';

const featuredFacilities = [
  {
    name: 'Lecture Hall',
    image: '/campus_lecture_hall.png',
    caption: 'Bright lecture spaces for large sessions and presentations.',
  },
  {
    name: 'Computer Lab',
    image: '/campus_computer_lab.png',
    caption: 'Modern workstations ready for practical sessions and labs.',
  },
  {
    name: 'Group Study',
    image: '/campus_group_study.png',
    caption: 'Flexible collaboration spaces for project teams and clubs.',
  },
  {
    name: 'Library',
    image: '/campus_library.png',
    caption: 'Quiet corners for focused learning and research.',
  },
];

const stats = [
  { value: '24', label: 'Spaces listed' },
  { value: '6', label: 'Facility types' },
  { value: '100%', label: 'Image-based browsing' },
];

const Resources = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshCatalog = () => {
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="resources-page">
      <section className="facility-hero">
        <div className="container facility-hero__layout">
          <div className="facility-hero__copy">
            <p className="section-label">Facilities Catalogue</p>
            <h1>Browse campus spaces with visual previews and add new facilities in seconds.</h1>
            <p>
              Discover lecture halls, labs, meeting rooms, and equipment through image cards that make it easy for users to explore and contribute new facilities.
            </p>

            <div className="facility-hero__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="facility-hero__stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="facility-hero__gallery">
            {featuredFacilities.map((facility) => (
              <article key={facility.name} className="facility-hero__card">
                <img src={facility.image} alt={facility.name} />
                <div>
                  <h3>{facility.name}</h3>
                  <p>{facility.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <main className="container facilities-layout">
        <div className="facilities-layout__main">
          <ResourceCatalog refreshSignal={refreshKey} />
        </div>
        <aside className="facilities-layout__sidebar">
          <ResourceForm onCreated={refreshCatalog} />
        </aside>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
