const Footer = () => {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="container">
        <div className="footer__panel">
          <div className="footer__grid">
            <div className="footer__brand">
              <p className="footer__eyebrow">Smart Campus Operations Hub</p>
              <p className="footer__brand-name">Campus coordination, made simpler.</p>
              <p className="footer__brand-desc">
                University system for managing resource bookings, incident tickets, and campus notifications.
              </p>
              <div className="footer__chips" aria-label="Core services">
                <span className="footer__chip">Bookings</span>
                <span className="footer__chip">Incidents</span>
                <span className="footer__chip">Notifications</span>
              </div>
            </div>

            <div className="footer__column">
              <p className="footer__col-title">About</p>
              <div className="footer__links">
                <a href="#" className="footer__link">University Services</a>
              </div>
            </div>

            <div className="footer__column">
              <p className="footer__col-title">Help</p>
              <div className="footer__links">
                <a href="#" className="footer__link">Support Center</a>
              </div>
            </div>

            <div className="footer__column">
              <p className="footer__col-title">Contact</p>
              <div className="footer__links">
                <a href="mailto:campus.ops@university.edu" className="footer__link">campus.ops@university.edu</a>
                <span className="footer__muted">Mon-Fri, 8:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>

          <div className="footer__bottom">
            <p className="footer__copy">© 2026 Smart Campus Operations Hub. All rights reserved.</p>
            <div className="footer__policy-links">
              <a href="#" className="footer__policy-link">Privacy</a>
              <a href="#" className="footer__policy-link">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
