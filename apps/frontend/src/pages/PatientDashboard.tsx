import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyPatientProfile, type Patient } from "../services/patientService";
import { getAppointmentsByPatient, type Appointment } from "../services/appointmentService";
import { getPatientInvoices, type Invoice } from "../services/billingService";
import { clearAuthSession } from "../services/authService";
import "./RoleDashboard.css";
import "./PatientDashboard.css";

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const dateLabel = (date?: string, time?: string) => {
  if (!date) return "Date not available";
  const parsed = new Date(`${date}T${time || "00:00:00"}`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const displayStatus = (status: string) =>
  status.toLowerCase().replace(/_/g, " ");

export default function PatientDashboard() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [billingError, setBillingError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setProfileError("");
        setAppointmentError("");
        setBillingError("");

        const profile = await getMyPatientProfile();
        if (!active) return;
        setPatient(profile);

        const [appointmentResult, invoiceResult] = await Promise.allSettled([
          getAppointmentsByPatient(profile.id),
          getPatientInvoices(profile.id),
        ]);

        if (!active) return;

        if (appointmentResult.status === "fulfilled") {
          setAppointments(appointmentResult.value);
        } else {
          setAppointmentError(
            appointmentResult.reason instanceof Error
              ? appointmentResult.reason.message
              : "Unable to load appointments.",
          );
        }

        if (invoiceResult.status === "fulfilled") {
          setInvoices(invoiceResult.value);
        } else {
          setBillingError(
            invoiceResult.reason instanceof Error
              ? invoiceResult.reason.message
              : "Unable to load billing information.",
          );
        }
      } catch (err: unknown) {
        if (!active) return;
        setProfileError(
          err instanceof Error ? err.message : "Unable to load your profile.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  const now = new Date();
  const inactiveStatuses = ["CANCELLED", "REJECTED", "COMPLETED"];
  const upcomingAppointments = appointments
    .filter((appointment) => {
      const visit = new Date(
        `${appointment.appointmentDate}T${appointment.startTime || "00:00:00"}`,
      );
      return (
        !Number.isNaN(visit.getTime()) &&
        visit >= now &&
        !inactiveStatuses.includes(appointment.status.toUpperCase())
      );
    })
    .sort((a, b) => {
      const first = new Date(`${a.appointmentDate}T${a.startTime}`);
      const second = new Date(`${b.appointmentDate}T${b.startTime}`);
      return first.getTime() - second.getTime();
    });

  const totalBilled = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + (invoice.amountPaid || 0), 0);
  const totalDue = invoices.reduce((sum, invoice) => sum + (invoice.amountDue || 0), 0);
  const nextAppointment = upcomingAppointments[0];

  return (
    <main className="role-dashboard patient-dashboard">
      <header className="role-dashboard-header patient-dashboard-header">
        <Link className="role-dashboard-brand" to="/app/patient/dashboard">
          <span className="patient-brand-mark">+</span> MedCore
        </Link>
        <nav className="patient-top-nav" aria-label="Patient navigation">
          <Link to="/app/patient/dashboard" aria-current="page">Dashboard</Link>
          <Link to="/app/appointments">Appointments</Link>
          <Link to="/app/medical-records">Medical records</Link>
          <Link to="/app/billing">Billing</Link>
        </nav>
        <button className="role-logout" onClick={handleLogout}>Sign out</button>
      </header>

      <section className="role-dashboard-content patient-dashboard-content">
        <div className="patient-dashboard-heading">
          <div>
            <p className="role-dashboard-eyebrow">YOUR PERSONAL HEALTH SPACE</p>
            <h1>Your health, <span>all in one place.</span></h1>
            <p className="role-dashboard-description">
              Keep track of your visits, health information and billing.
            </p>
          </div>
          <Link className="patient-primary-action" to="/app/find-doctor">
            <span aria-hidden="true">+</span> Find a doctor
          </Link>
        </div>

        {profileError && (
          <div className="patient-dashboard-alert" role="alert">
            <strong>We couldn't load your patient profile.</strong>
            <p>{profileError}</p>
            <p>Please sign in again if your session has expired.</p>
          </div>
        )}

        <section className="patient-hero-card">
          <div className="patient-hero-copy">
            <span className="patient-hero-kicker">YOUR MEDCORE ACCOUNT</span>
            <h2>
              {loading
                ? "Welcome to MedCore"
                : patient
                  ? `Hello, ${patient.fullName}`
                  : "Welcome to MedCore"}
            </h2>
            <p>
              {patient?.patientNumber
                ? `Patient ID · ${patient.patientNumber}`
                : "Your healthcare journey starts here."}
            </p>
            <div className="patient-hero-actions">
              <Link to="/app/appointments">View appointments <span>→</span></Link>
              <Link to="/app/medical-records">View medical records <span>→</span></Link>
            </div>
          </div>
          <div className="patient-hero-symbol" aria-hidden="true">
            <span>+</span>
            <i />
          </div>
        </section>

        <div className="patient-dashboard-section-heading">
          <div>
            <p className="patient-section-kicker">AT A GLANCE</p>
            <h2>Your healthcare overview</h2>
          </div>
          <span className="patient-live-indicator">
            <i /> Personal dashboard
          </span>
        </div>

        <div className="patient-overview-grid">
          <article className="patient-overview-card">
            <div className="patient-overview-top">
              <span className="patient-overview-icon patient-icon-blue">▦</span>
              <span className="patient-overview-caption">ALL VISITS</span>
            </div>
            <strong>{loading ? "—" : appointmentError ? "—" : appointments.length}</strong>
            <p>Total appointments</p>
            <Link to="/app/appointments">View appointments <span>→</span></Link>
          </article>

          <article className="patient-overview-card">
            <div className="patient-overview-top">
              <span className="patient-overview-icon patient-icon-green">↗</span>
              <span className="patient-overview-caption">UPCOMING</span>
            </div>
            <strong>{loading ? "—" : appointmentError ? "—" : upcomingAppointments.length}</strong>
            <p>Upcoming visits</p>
            <Link to="/app/appointments">Manage visits <span>→</span></Link>
          </article>

          <article className="patient-overview-card">
            <div className="patient-overview-top">
              <span className="patient-overview-icon patient-icon-violet">₹</span>
              <span className="patient-overview-caption">TOTAL BILLED</span>
            </div>
            <strong className="patient-money-value">
              {loading || billingError ? "—" : money(totalBilled)}
            </strong>
            <p>Across your invoices</p>
            <Link to="/app/billing">View billing <span>→</span></Link>
          </article>

          <article className="patient-overview-card">
            <div className="patient-overview-top">
              <span className="patient-overview-icon patient-icon-green">₹</span>
              <span className="patient-overview-caption">AMOUNT PAID</span>
            </div>
            <strong className="patient-money-value">
              {loading || billingError ? "—" : money(totalPaid)}
            </strong>
            <p>Payments recorded</p>
            <Link to="/app/billing">View payments <span>→</span></Link>
          </article>

          <article className="patient-overview-card">
            <div className="patient-overview-top">
              <span className="patient-overview-icon patient-icon-amber">₹</span>
              <span className="patient-overview-caption">OUTSTANDING</span>
            </div>
            <strong className="patient-money-value">
              {loading || billingError ? "—" : money(totalDue)}
            </strong>
            <p>Remaining balance</p>
            <Link to="/app/billing">Review invoices <span>→</span></Link>
          </article>
        </div>

        <div className="patient-dashboard-lower-grid">
          <section className="patient-panel">
            <div className="patient-panel-heading">
              <div>
                <p className="patient-section-kicker">YOUR SCHEDULE</p>
                <h2>Next appointment</h2>
              </div>
              <Link to="/app/appointments">View all <span>→</span></Link>
            </div>

            {loading ? (
              <div className="patient-panel-message">Loading your appointments…</div>
            ) : appointmentError ? (
              <div className="patient-panel-message patient-panel-error" role="alert">
                {appointmentError}
              </div>
            ) : nextAppointment ? (
              <article className="patient-next-appointment">
                <div className="patient-appointment-date-block">
                  <span>{new Date(`${nextAppointment.appointmentDate}T${nextAppointment.startTime}`).toLocaleDateString("en-IN", { month: "short" })}</span>
                  <strong>{new Date(`${nextAppointment.appointmentDate}T${nextAppointment.startTime}`).getDate()}</strong>
                  <small>{new Date(`${nextAppointment.appointmentDate}T${nextAppointment.startTime}`).toLocaleDateString("en-IN", { weekday: "short" })}</small>
                </div>
                <div className="patient-next-appointment-info">
                  <span className={`patient-status patient-status-${nextAppointment.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                    {displayStatus(nextAppointment.status)}
                  </span>
                  <h3>{nextAppointment.doctorName || "Your doctor"}</h3>
                  <p>{nextAppointment.reason || "General consultation"}</p>
                  <p className="patient-appointment-time">
                    {dateLabel(nextAppointment.appointmentDate)} · {nextAppointment.startTime}
                    {nextAppointment.endTime ? `–${nextAppointment.endTime}` : ""}
                  </p>
                </div>
              </article>
            ) : (
              <div className="patient-panel-empty">
                <span aria-hidden="true">▦</span>
                <h3>No upcoming appointments</h3>
                <p>Your next scheduled visit will appear here.</p>
                <Link to="/app/find-doctor">Find a doctor <span>→</span></Link>
              </div>
            )}
          </section>

          <section className="patient-panel patient-profile-panel">
            <div className="patient-panel-heading">
              <div>
                <p className="patient-section-kicker">YOUR DETAILS</p>
                <h2>Patient profile</h2>
              </div>
              <span className="patient-profile-avatar" aria-hidden="true">♡</span>
            </div>

            {loading ? (
              <div className="patient-panel-message">Loading your profile…</div>
            ) : patient ? (
              <div className="patient-profile-details">
                <div><span>Full name</span><strong>{patient.fullName}</strong></div>
                <div><span>Patient ID</span><strong>{patient.patientNumber || "Not recorded"}</strong></div>
                <div><span>Blood group</span><strong>{patient.bloodGroup || "Not added yet"}</strong></div>
                <div><span>Phone</span><strong>{patient.phone || "Not added yet"}</strong></div>
                <div className="patient-profile-email"><span>Email address</span><strong>{patient.email || "Not added yet"}</strong></div>
              </div>
            ) : (
              <div className="patient-panel-message">Your profile details are unavailable.</div>
            )}
            <Link className="patient-profile-link" to="/app/medical-records">
              Go to medical records <span>→</span>
            </Link>
          </section>
        </div>

        <section className="patient-shortcuts-section">
          <div className="patient-dashboard-section-heading">
            <div>
              <p className="patient-section-kicker">QUICK ACCESS</p>
              <h2>What would you like to do?</h2>
            </div>
          </div>
          <div className="patient-shortcuts-grid">
            <Link className="patient-shortcut-card" to="/app/find-doctor">
              <span className="patient-shortcut-icon patient-icon-blue">✚</span>
              <span><strong>Find a doctor</strong><small>Explore doctors and request a visit.</small></span>
              <span className="patient-shortcut-arrow">↗</span>
            </Link>
            <Link className="patient-shortcut-card" to="/app/appointments">
              <span className="patient-shortcut-icon patient-icon-green">▦</span>
              <span><strong>Appointments</strong><small>Review your scheduled visits.</small></span>
              <span className="patient-shortcut-arrow">↗</span>
            </Link>
            <Link className="patient-shortcut-card" to="/app/medical-records">
              <span className="patient-shortcut-icon patient-icon-violet">♡</span>
              <span><strong>Medical records</strong><small>Access your available health records.</small></span>
              <span className="patient-shortcut-arrow">↗</span>
            </Link>
            <Link className="patient-shortcut-card" to="/app/billing">
              <span className="patient-shortcut-icon patient-icon-amber">₹</span>
              <span><strong>Billing and invoices</strong><small>Review payments and balances.</small></span>
              <span className="patient-shortcut-arrow">↗</span>
            </Link>
          </div>
        </section>

        <footer className="patient-dashboard-footer">
          <span className="patient-footer-brand">+ MedCore</span>
          <span>Your health information, organized with care.</span>
        </footer>
      </section>
    </main>
  );
}
