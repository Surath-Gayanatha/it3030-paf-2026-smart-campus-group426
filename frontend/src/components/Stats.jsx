const statsData = [
  {
    label: 'Total Resources',
    value: '148',
    change: '+6 this month',
    trend: 'up',
    helper: 'Lecture halls, labs, equipment, and sports venues',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 10h1" />
        <path d="M14 10h1" />
        <path d="M9 14h1" />
        <path d="M14 14h1" />
      </svg>
    ),
  },
  {
    label: 'Pending Bookings',
    value: '27',
    change: 'Awaiting approval',
    trend: 'neutral',
    helper: 'Requests queued for admin and department confirmation',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'Open Tickets',
    value: '12',
    change: '-4 this week',
    trend: 'down',
    helper: 'Active incidents currently handled by maintenance teams',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const trendClass = {
  up: 'stat-card__change stat-card__change--up',
  neutral: 'stat-card__change stat-card__change--neutral',
  down: 'stat-card__change stat-card__change--down',
};

const iconClass = {
  up: 'stat-card__icon stat-card__icon--blue',
  neutral: 'stat-card__icon stat-card__icon--amber',
  down: 'stat-card__icon stat-card__icon--red',
};

const Stats = () => {
  return (
    <section className="stats" id="dashboard" aria-labelledby="stats-title">
      <div className="container">
        <div className="stats__header">
          <div>
            <p className="section-label">System Overview</p>
            <h2 className="section-title" id="stats-title">Operational Snapshot</h2>
          </div>
          <p className="stats__date">Updated: April 9, 2026</p>
        </div>

        <div className="stats__grid">
          {statsData.map((item) => (
            <article className="stat-card" key={item.label}>
              <div className="stat-card__header">
                <p className="stat-card__label">{item.label}</p>
                <div className={iconClass[item.trend]}>{item.icon}</div>
              </div>
              <p className="stat-card__value">{item.value}</p>
              <p className={trendClass[item.trend]}>{item.change}</p>
              <p className="stat-card__footer">{item.helper}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
