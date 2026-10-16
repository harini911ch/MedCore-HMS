import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import "./Register.css";

const API_BASE_URL = "http://localhost:8081/api";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role: "PATIENT",
        }),
      });

      if (!response.ok) {
        let message = "Registration failed. Please check your details and try again.";

        try {
          const data = await response.json();
          message =
            data.message ||
            data.error?.message ||
            data.error ||
            message;
        } catch {
          // Keep the default message if the server response is not JSON.
        }

        throw new Error(
          typeof message === "string" ? message : "Registration failed."
        );
      }

      setSuccess(true);
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Unable to connect to MedCore HMS. Make sure the backend is running on port 8081."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <header className="register-topbar">
        <Link to="/" className="register-brand" aria-label="MedCore HMS home">
          <span className="register-brand-icon" aria-hidden="true">+</span>
          <span>MedCore <strong>HMS</strong></span>
        </Link>

        <Link to="/" className="register-home-link">
          <span aria-hidden="true">←</span> Back to home
        </Link>
      </header>

      <section className="register-layout">
        <aside className="register-intro">
          <span className="register-eyebrow">
            YOUR HEALTHCARE, CONNECTED
          </span>

          <h1>
            Better care begins
            <br />
            with <span>one account.</span>
          </h1>

          <p className="register-intro-description">
            Create your MedCore account to get started with a more organised
            healthcare experience.
          </p>

          <div className="register-benefits">
            <div className="register-benefit">
              <span className="register-benefit-icon" aria-hidden="true">✓</span>
              <div>
                <strong>Your healthcare in one place</strong>
                <p>Access your healthcare journey through one account.</p>
              </div>
            </div>

            <div className="register-benefit">
              <span className="register-benefit-icon" aria-hidden="true">✓</span>
              <div>
                <strong>A simpler experience</strong>
                <p>Get started with a clear, straightforward registration.</p>
              </div>
            </div>

            <div className="register-benefit">
              <span className="register-benefit-icon" aria-hidden="true">✓</span>
              <div>
                <strong>Designed around patients</strong>
                <p>Your account starts with the essentials.</p>
              </div>
            </div>
          </div>

          <p className="register-trust-note">
            A more connected way to manage healthcare.
          </p>
        </aside>

        <section className="register-card">
          {!success ? (
            <>
              <div className="register-card-heading">
                <span className="register-card-kicker">GET STARTED</span>
                <h2>Create your account</h2>
                <p>Enter your details to join MedCore HMS.</p>
              </div>

              {error && (
                <div className="register-alert register-alert-error" role="alert">
                  <span aria-hidden="true">!</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="register-form">
                <div className="register-field">
                  <label htmlFor="register-full-name">Full name</label>
                  <input
                    id="register-full-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="register-email">Email address</label>
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={150}
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="register-phone">
                    Phone number <span className="register-optional">(optional)</span>
                  </label>
                  <input
                    id="register-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    maxLength={20}
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="register-password">Password</label>
                  <div className="register-password-wrap">
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={8}
                      maxLength={72}
                    />
                    <button
                      type="button"
                      className="register-password-toggle"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="register-confirm-password">
                    Confirm password
                  </label>
                  <input
                    id="register-confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                    maxLength={72}
                  />
                </div>

                <p className="register-role-note">
                  Account type: <strong>Patient</strong>
                </p>

                <button
                  type="submit"
                  className="register-submit"
                  disabled={loading}
                >
                  {loading ? "Creating your account..." : "Create account"}
                  {!loading && <span aria-hidden="true">→</span>}
                </button>

                <p className="register-terms-note">
                  By creating an account, you confirm that the details you
                  provide are accurate.
                </p>
              </form>

              <div className="register-login-prompt">
                Already have an account? <Link to="/login">Sign in</Link>
              </div>
            </>
          ) : (
            <div className="register-success">
              <div className="register-success-icon" aria-hidden="true">✓</div>
              <span className="register-card-kicker">REGISTRATION COMPLETE</span>
              <h2>Your account has been created!</h2>
              <p>
                Welcome to MedCore HMS, {fullName.trim()}. You can now sign in
                with your email address and password.
              </p>
              <Link to="/login" className="register-submit register-success-link">
                Continue to sign in <span aria-hidden="true">→</span>
              </Link>
              <Link to="/" className="register-success-home">Return to home</Link>
            </div>
          )}
        </section>
      </section>

      <footer className="register-footer">
        <span>© {new Date().getFullYear()} MedCore HMS</span>
        <span>Healthcare, made more connected.</span>
      </footer>
    </main>
  );
}
