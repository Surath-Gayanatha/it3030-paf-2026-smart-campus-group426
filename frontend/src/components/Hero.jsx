import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const slides = [
  {
    src: '/campus_library.png',
    caption: 'University Library — Study & Research Spaces',
  },
  {
    src: '/campus_lecture_hall.png',
    caption: 'Lecture Halls — Book for Academic Sessions',
  },
  {
    src: '/campus_computer_lab.png',
    caption: 'Computer Labs — Reserve Workstations & Equipment',
  },
  {
    src: '/campus_stadium.png',
    caption: 'Indoor Stadium — Manage Sports Facility Bookings',
  },
  {
    src: '/campus_group_study.png',
    caption: 'Collaboration Rooms — Group Study & Meetings',
  },
];

const Carousel = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="carousel" role="region" aria-label="Campus facility photos">
      <div
        className="carousel__track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div className="carousel__slide" key={i}>
            <img src={slide.src} alt={slide.caption} loading={i === 0 ? 'eager' : 'lazy'} />
            <div className="carousel__caption">
              <p className="carousel__caption-text">{slide.caption}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="carousel__nav">
        <button
          className="carousel__btn"
          onClick={prev}
          id="carousel-prev"
          aria-label="Previous slide"
        >
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        <div className="carousel__dots" role="tablist" aria-label="Slide indicators">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`carousel__dot${i === current ? ' active' : ''}`}
              onClick={() => setCurrent(i)}
              id={`carousel-dot-${i}`}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          className="carousel__btn"
          onClick={next}
          id="carousel-next"
          aria-label="Next slide"
        >
          <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  );
};

const Hero = () => {
  return (
    <section className="hero" id="hero" aria-label="Hero section">
      <div className="container">
        <div className="hero__grid">
          {/* Left: Text */}
          <div className="hero__content">
            <div className="hero__badge" aria-label="System status">
              <span className="hero__badge-dot" aria-hidden="true" />
              System Online
            </div>

            <h1 className="hero__heading">
              Manage Campus<br />
              <span>Resources Efficiently</span>
            </h1>

            <p className="hero__subtext">
              Centralized system for booking facilities and reporting campus issues.
            </p>

            <div className="hero__actions">
              <Link to="/resources" className="btn-primary" id="hero-book-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Book a Resource
              </Link>
              <a href="#dashboard" className="btn-secondary" id="hero-report-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Report an Issue
              </a>
            </div>

            {/* Quick stats */}
            <div className="hero__meta">
              <div className="hero__meta-item">
                <div className="hero__meta-number">48</div>
                <div className="hero__meta-label">Facilities Available</div>
              </div>
              <div className="hero__meta-divider" aria-hidden="true" />
              <div className="hero__meta-item">
                <div className="hero__meta-number">124</div>
                <div className="hero__meta-label">Active Bookings</div>
              </div>
              <div className="hero__meta-divider" aria-hidden="true" />
              <div className="hero__meta-item">
                <div className="hero__meta-number">97%</div>
                <div className="hero__meta-label">Resolution Rate</div>
              </div>
            </div>
          </div>

          {/* Right: Carousel */}
          <div className="hero__carousel-wrapper">
            <Carousel />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
