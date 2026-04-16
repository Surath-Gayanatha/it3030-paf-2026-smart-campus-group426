import { Link } from 'react-router-dom';
import ResourceCatalog from '../components/Resources/ResourceCatalog';
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
  { value: '24+', label: 'Spaces' },
  { value: '6', label: 'Types' },
  { value: '100%', label: 'Visual' },
];

const Resources = () => {
  return (
    <div className="resources-page">
      <section className="facility-hero">
        <div className="container facility-hero__layout">
          <div className="facility-hero__copy">
            <p className="section-label">Facilities Catalogue</p>
            <h1>Browse campus spaces with visual previews, details, and booking-ready information.</h1>
            <p>
              Discover lecture halls, labs, meeting rooms, and equipment through image cards that show the key information students need at a glance.
            </p>

            <div className="facility-hero__actions">
              <Link to="/facilities/create" className="btn-primary">Add a facility</Link>
              <a href="#resources" className="btn-secondary">Explore facilities</a>
            </div>

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
        <ResourceCatalog />
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
