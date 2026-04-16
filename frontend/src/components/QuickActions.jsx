import { Link } from 'react-router-dom';

const actionCards = [
  {
    title: 'Book Facilities',
    description: 'Reserve lecture halls, laboratories, and equipment with approval tracking.',
    href: '/resources',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" ry="2" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: 'View My Bookings',
    description: 'Check your approved, pending, and upcoming campus resource bookings.',
    href: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: 'Report Incident',
    description: 'Submit maintenance and safety incidents with location and priority details.',
    href: '/tickets',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    title: 'Track Tickets',
    description: 'Monitor incident progress, status updates, and maintenance resolution notes.',
    href: '/tickets',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const QuickActions = () => {
  return (
    <section className="quick-actions" id="quick-actions" aria-label="Quick actions">
      <div className="container">
        <div className="quick-actions__grid">
          {actionCards.map((card) => (
            <Link className="action-card" to={card.href} key={card.title}>
              <span className="action-card__icon">{card.icon}</span>
              <h3 className="action-card__title">{card.title}</h3>
              <p className="action-card__desc">{card.description}</p>
              <span className="action-card__arrow">
                Open
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;
