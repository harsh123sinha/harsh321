import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Co-development mission strip — full-width, below Happy Clients stats on Home.
 */
export default function MissionCoDevBanner({ className = '' }) {
  return (
    <section
      className={`htls-mission-banner w-full ${className}`}
      aria-label="Co-development mission: 1 Zameen, Char Parivar, 4 Floor"
    >
      <div className="htls-mission-banner__inner">
        <div className="htls-mission-banner__main">
          <div className="htls-mission-banner__content">
            <p className="htls-mission-banner__label">
              Our Mission :- Har Parivaar Ka Hoga Apna Ghar
            </p>
            <h2 className="htls-mission-banner__headline">1 Zameen, Char Parivar, 4 Floor</h2>
            <p className="htls-mission-banner__sub">
              Wo Bhi Kist Mein — poore legal document ke saath, to{' '}
              <span className="htls-mission-banner__accent-red">der kis baat ki?</span>
            </p>
            <p className="htls-mission-banner__body">
              Per paisa 4 hisso mein — Patna mein apna ghar ab sabke liye mumkin.
            </p>
          </div>

          <div className="htls-mission-building" aria-hidden="true">
            <div>
              <div className="htls-mission-building__stack">
                <div className="htls-mission-building__floor" />
                <div className="htls-mission-building__floor" />
                <div className="htls-mission-building__floor" />
                <div className="htls-mission-building__floor" />
              </div>
              <div className="htls-mission-building__ground" />
            </div>
          </div>
        </div>

        <div className="htls-mission-banner__cta-row">
          <Link to="/mission/register" className="htls-mission-banner__cta">
            <span>Register With Us</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
