
import { Link } from "react-router-dom";
import "./landing.css";

const features = [
  {
    number: "01",
    title: "Appointments made simple",
    description:
      "Book appointments, check schedules, and keep track of upcoming visits in one place.",
    icon: "calendar",
  },
  {
    number: "02",
    title: "Connected medical records",
    description:
      "Help authorized healthcare teams access patient histories, prescriptions, and clinical information.",
    icon: "records",
  },
  {
    number: "03",
    title: "Laboratory and pharmacy",
    description:
      "Manage lab orders, test results, medicine inventory, and prescription dispensing.",
    icon: "lab",
  },
  {
    number: "04",
    title: "Transparent billing",
    description:
      "Keep invoices, payments, and billing information organized throughout each visit.",
    icon: "billing",
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
        <Link to="/" className="brand">
          <span className="brand-mark">✚</span>
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
          <Link to="/login" className="login-link">
            Log in
          </Link>
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
              A BETTER WAY TO MANAGE HEALTHCARE
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
              <Link to="/login" className="button button-secondary">
                Sign in to your account
              </Link>
            </div>

            <div className="hero-trust">
              <div className="trust-icon">✓</div>
              <p>
                <strong>One connected experience</strong>
                <span>Designed around healthcare workflows</span>
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=85"
                alt="Modern hospital with a bright, welcoming healthcare environment"
              />
              <div className="image-tint" />

              <div className="image-caption">
                <span className="caption-symbol">✚</span>
                <div>
                  <strong>Care, connected.</strong>
                  <p>People. Information. Better coordination.</p>
                </div>
              </div>
            </div>

            <div className="hero-floating-card">
              <span className="floating-icon">♥</span>
              <div>
                <strong>Care comes first</strong>
                <p>Every step, more organized.</p>
              </div>
            </div>

            <div className="hero-decoration decoration-one" />
            <div className="hero-decoration decoration-two" />
          </div>
        </section>

        <section className="intro-strip" id="how-it-works">
          <div>
            <span className="strip-label">ONE PLATFORM</span>
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
                  <div className="feature-icon">
                    <FeatureIcon type={feature.icon} />
                  </div>
                  <span className="feature-number">{feature.number}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-arrow" aria-hidden="true">
                  ↗
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <span className="eyebrow">YOUR HEALTHCARE JOURNEY STARTS HERE</span>
            <h2>A more connected healthcare experience.</h2>
            <p>
              Sign in to continue, or create an account to get started.
              Available features depend on your account and permissions.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="button button-white">
                Create an account <span aria-hidden="true">→</span>
              </Link>
              <Link to="/login" className="cta-login">
                Already registered? Log in
              </Link>
            </div>
          </div>
          <div className="cta-cross" aria-hidden="true">✚</div>
        </section>
      </main>

      <footer className="site-footer">
        <Link to="/" className="brand footer-brand">
          <span className="brand-mark">✚</span>
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
