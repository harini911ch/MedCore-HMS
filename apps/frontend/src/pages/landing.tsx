import { Link } from "react-router-dom";
import "./landing.css";

const features = [
  {
    number: "01",
    icon: "calendar",
    title: "Appointments made simple",
    description:
      "Book appointments, check schedules, and keep track of upcoming visits in one organized place.",
  },
  {
    number: "02",
    icon: "records",
    title: "Connected medical records",
    description:
      "Give authorized healthcare teams a clearer view of patient histories and clinical information.",
  },
  {
    number: "03",
    icon: "lab",
    title: "Laboratory and pharmacy",
    description:
      "Organize laboratory orders, test results, prescriptions, and medicine inventory.",
  },
  {
    number: "04",
    icon: "billing",
    title: "Simplified billing",
    description:
      "Keep invoices, payments, and billing information together throughout each visit.",
  },
];

function FeatureIcon({ type }: { type: string }) {
  if (type === "calendar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h6" />
      </svg>
    );
  }

  if (type === "records") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5M8 12h7M8 16h7" />
      </svg>
    );
  }

  if (type === "lab") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 3h6M10 3v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3" />
        <path d="M8 15h8M10 18h4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="15" rx="3" />
      <path d="M3 10h18M7 15h4M16 14v4M14 16h4" />
    </svg>
  );
}

function Landing() {
  return (
    <div className="landing-page">
      <header className="site-header">
        <Link to="/" className="brand" aria-label="MedCore home">
          <span className="brand-mark" aria-hidden="true">✚</span>
          <span>
            <strong>MedCore</strong>
            <small>HOSPITAL MANAGEMENT</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </nav>

        <div className="header-actions">
          <Link to="/login" className="login-link">Sign in</Link>
          <Link to="/register" className="button button-primary header-cta">
            Get started <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <main>
        <section className="hero-section" id="about">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              A SMARTER WAY TO MANAGE HEALTHCARE
            </div>

            <h1>
              Better care starts
              <br />
              with <span>better connections.</span>
            </h1>

            <p className="hero-description">
              One connected platform for patients, doctors, and hospital
              teams. Manage appointments, medical records, laboratory
              services, pharmacy, and billing with greater clarity.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="button button-primary">
                Explore MedCore <span aria-hidden="true">→</span>
              </Link>
              <a href="#features" className="button button-secondary">
                Discover features
              </a>
            </div>

            <div className="hero-trust">
              <div className="trust-icon" aria-hidden="true">✓</div>
              <p>
                <strong>One connected experience</strong>
                <span>Designed around healthcare workflows</span>
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="welcome-panel">
              <div className="welcome-panel-top">
                <div className="welcome-symbol" aria-hidden="true">✚</div>
                <span className="welcome-label">
                  YOUR HEALTHCARE, CONNECTED
                </span>
              </div>

              <div className="welcome-copy">
                <span className="welcome-eyebrow">WELCOME TO MEDCORE</span>
                <h2>Your healthcare journey starts here.</h2>
                <p>
                  A more connected healthcare experience. Sign in to continue,
                  or create an account to get started.
                </p>
              </div>

              <div className="welcome-actions">
                <Link to="/register" className="button button-white">
                  Create an account <span aria-hidden="true">→</span>
                </Link>
                <Link to="/login" className="welcome-login">
                  Already registered? <strong>Sign in</strong>
                </Link>
              </div>

              <div className="welcome-divider" />

              <div className="welcome-footer">
                <span className="welcome-footer-icon" aria-hidden="true">✓</span>
                <p>
                  <strong>Your account. Your access.</strong>
                  <span>Features tailored to your permissions.</span>
                </p>
              </div>

              <span className="welcome-decoration welcome-decoration-one" />
              <span className="welcome-decoration welcome-decoration-two" />
              <span className="welcome-cross" aria-hidden="true">✚</span>
            </div>

            <div className="floating-note floating-note-top">
              <span className="floating-note-icon" aria-hidden="true">♡</span>
              <span>
                <strong>Care comes first</strong>
                <small>Every step, more organized</small>
              </span>
            </div>

            <div className="floating-note floating-note-bottom">
              <span className="floating-note-icon floating-note-icon-blue" aria-hidden="true">⌘</span>
              <span>
                <strong>One connected platform</strong>
                <small>People, records, and care</small>
              </span>
            </div>
          </div>
        </section>

        <section className="intro-strip" id="how-it-works">
          <div>
            <span className="strip-label">ONE CONNECTED PLATFORM</span>
            <h2>Everything works better together.</h2>
          </div>
          <p>
            From the first appointment to the final invoice, bring essential
            hospital workflows into one organized experience.
          </p>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="eyebrow">BUILT FOR CONNECTED CARE</span>
            <h2>Healthcare operations, made clearer.</h2>
            <p>
              The essential tools patients and hospital teams need, organized
              in one place.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.number}>
                <div className="feature-card-top">
                  <div className={`feature-icon feature-icon-${feature.icon}`}>
                    <FeatureIcon type={feature.icon} />
                  </div>
                  <span className="feature-number">{feature.number}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Link to="/" className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">✚</span>
          <span>
            <strong>MedCore</strong>
            <small>HOSPITAL MANAGEMENT</small>
          </span>
        </Link>
        <p>Connected workflows. More coordinated care.</p>
        <span>© 2026 MedCore HMS</span>
      </footer>
    </div>
  );
}

export default Landing;