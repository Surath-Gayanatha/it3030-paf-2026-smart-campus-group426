const featureData = [
  {
    title: 'Resource Booking Management',
    description:
      'Coordinate facility reservations for lecture halls, labs, and equipment using role-based approvals.',
    points: ['Real-time availability', 'Approval workflow', 'Conflict-free scheduling'],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: 'Maintenance & Incident Tracking',
    description:
      'Capture campus incidents quickly and route requests to relevant technical and facility teams.',
    points: ['Priority categorization', 'Ticket lifecycle updates', 'Department assignment'],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l9 4.9v7.8L12 21l-9-5.3V7.9L12 3z" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
  {
    title: 'Real-Time Notifications',
    description:
      'Receive instant updates for booking decisions, ticket responses, and important system announcements.',
    points: ['Booking confirmations', 'Status change alerts', 'System update notices'],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

const Features = () => {
  return (
    <section className="section" id="resources" aria-labelledby="features-title">
      <div className="container">
        <p className="section-label">Platform Capabilities</p>
        <h2 className="section-title" id="features-title">Built for Daily Campus Operations</h2>
        <p className="section-subtitle">
          Structured tools for students and staff to manage facilities, incidents, and communication from a single system.
        </p>

        <div className="features__grid">
          {featureData.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-card__icon">{feature.icon}</div>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__desc">{feature.description}</p>
              <ul className="feature-card__list" aria-label={`${feature.title} details`}>
                {feature.points.map((point) => (
                  <li className="feature-card__list-item" key={point}>
                    <span className="feature-card__list-dot" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
