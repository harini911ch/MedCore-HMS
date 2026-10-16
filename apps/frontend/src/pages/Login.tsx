import { useState, type FormEvent } from "react";
import { login, saveAuthSession } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const auth = await login({ email, password });
      saveAuthSession(auth);

      const destinations: Record<string, string> = {
        SUPER_ADMIN: "/app/admin/dashboard",
        HOSPITAL_ADMIN: "/app/admin/dashboard",
        DOCTOR: "/app/doctor/dashboard",
        PATIENT: "/app/patient/dashboard",
        NURSE: "/app/staff/dashboard",
        RECEPTIONIST: "/app/staff/dashboard",
        LAB_TECHNICIAN: "/app/staff/dashboard",
        PHARMACIST: "/app/staff/dashboard",
        ACCOUNTANT: "/app/staff/dashboard",
      };

      const destination = destinations[auth.role];

      if (!destination) {
        setMessage(`Your account role (${auth.role}) has no dashboard configured yet.`);
        return;
      }

      navigate(destination, { replace: true });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while signing in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <Link to="/" className="login-brand" aria-label="MedCore home">
          <span className="login-brand-icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="13" fill="currentColor" />
              <path
                d="M20 9v22M9 20h22"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>
            <strong>MedCore</strong>
            <small>HEALTHCARE MANAGEMENT</small>
          </span>
        </Link>

        <Link to="/" className="login-back-link">
          <span aria-hidden="true">←</span> Back to home
        </Link>
      </header>

      <section className="login-layout">
        <div className="login-welcome">
          <div className="login-eyebrow">
            <span className="login-eyebrow-dot" />
            YOUR HEALTHCARE, CONNECTED
          </div>

          <h1>
            Better care
            <br />
            begins <span>with you.</span>
          </h1>

          <p className="login-welcome-description">
            Welcome back to MedCore. Sign in to access your healthcare
            experience through one secure, connected platform.
          </p>

          <div className="login-benefits">
            <div className="login-benefit">
              <span className="login-benefit-icon">✓</span>
              <div>
                <strong>One connected platform</strong>
                <p>Access the tools relevant to your account.</p>
              </div>
            </div>

            <div className="login-benefit">
              <span className="login-benefit-icon">✓</span>
              <div>
                <strong>Care, organised better</strong>
                <p>Keep important healthcare activities together.</p>
              </div>
            </div>

            <div className="login-benefit">
              <span className="login-benefit-icon">✓</span>
              <div>
                <strong>Designed around your role</strong>
                <p>Your access depends on your account permissions.</p>
              </div>
            </div>
          </div>

          <div className="login-trust-note">
            <span className="login-shield" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="m8.5 12 2.2 2.2 4.8-5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>
              <strong>Your account. Your access.</strong>
              <small>Sign in using your registered credentials.</small>
            </span>
          </div>
        </div>

        <div className="login-form-side">
          <div className="login-card">
            <div className="login-card-heading">
              <span className="login-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M4.5 21a7.5 7.5 0 0 1 15 0"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div>
                <h2>Welcome back</h2>
                <p>Enter your details to sign in to your account.</p>
              </div>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <label htmlFor="login-email">Email address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="m4 7 8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="login-password-heading">
                <label htmlFor="login-password">Password</label>
                <button
                  className="login-text-button"
                  type="button"
                  onClick={() =>
                    setMessage(
                      "Password recovery is not connected yet. Please contact your administrator if you need help."
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8 10V7a4 4 0 1 1 8 0v3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="15" r="1.2" fill="currentColor" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  className="login-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 3 21 21M10.6 10.7a2 2 0 0 0 2.7 2.7"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.1 0 8.5 4.7 9.5 7-.4.9-1.2 2.1-2.3 3.2M6.2 6.3C3.8 8 2.7 10.5 2.5 12c.6 1.3 2.2 3.8 5.5 5.4A10 10 0 0 0 12 18"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button className="login-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in to MedCore"}
                <span aria-hidden="true">→</span>
              </button>

              {message && (
                <p className="login-message" role="status">
                  {message}
                </p>
              )}
            </form>

            <div className="login-divider">
              <span />
              <span>NEW TO MEDCORE?</span>
              <span />
            </div>

            <p className="login-register">
              Create an account to get started.
              <Link to="/register"> Create account</Link>
            </p>
          </div>

          <p className="login-footer-note">
            By continuing, you agree to use MedCore in accordance with your
            organisation's policies.
          </p>
        </div>
      </section>

      <footer className="login-page-footer">
        <span>&copy; {new Date().getFullYear()} MedCore HMS</span>
        <span>Healthcare, connected.</span>
      </footer>
    </main>
  );
}
