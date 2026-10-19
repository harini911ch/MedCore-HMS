import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyDoctorAppointments,
  updateMyAppointmentStatus,
  type Appointment,
} from "../services/appointmentService";
import { getMyDoctorProfile, type Doctor } from "../services/doctorService";
import { clearAuthSession } from "../services/authService";
import "./DoctorDashboard.css";

function formatDate(value: string) {
  if (!value) return "Date unavailable";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string) {
  if (!value) return "Time unavailable";
  const parts = value.split(":");
  const date = new Date();
  date.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function canTransition(status: string, next: string) {
  return (
    (status === "PENDING" &&
      (next === "CONFIRMED" || next === "CANCELLED")) ||
    (status === "CONFIRMED" &&
      (next === "IN_PROGRESS" || next === "CANCELLED")) ||
    (status === "IN_PROGRESS" && next === "COMPLETED")
  );
}

function nextAction(status: string) {
  if (status === "PENDING") return { label: "Confirm appointment", status: "CONFIRMED" };
  if (status === "CONFIRMED") return { label: "Start consultation", status: "IN_PROGRESS" };
  if (status === "IN_PROGRESS") return { label: "Complete consultation", status: "COMPLETED" };
  return null;
}

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [profile, records] = await Promise.all([
        getMyDoctorProfile(),
        getMyDoctorAppointments(),
      ]);
      setDoctor(profile);
      setAppointments(records);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your clinical workspace.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const today = new Date().toLocaleDateString("en-CA");
  const todaysAppointments = useMemo(
    () => appointments.filter((a) => a.appointmentDate === today),
    [appointments, today],
  );

  const visibleAppointments = useMemo(() => {
    const filtered = appointments.filter((a) => {
      if (filter === "TODAY") return a.appointmentDate === today;
      if (filter === "UPCOMING") {
        return a.appointmentDate >= today &&
          !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(a.status);
      }
      return true;
    });

    return [...filtered].sort((a, b) =>
      `${a.appointmentDate}T${a.startTime}`.localeCompare(
        `${b.appointmentDate}T${b.startTime}`,
      ),
    );
  }, [appointments, filter, today]);

  async function changeStatus(appointment: Appointment, status: string) {
    setActionError("");
    setUpdatingId(appointment.id);

    try {
      const updated = await updateMyAppointmentStatus(appointment.id, status);
      setAppointments((current) =>
        current.map((item) => item.id === updated.id ? updated : item),
      );
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Unable to update the appointment.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <main className="role-dashboard doctor-workspace">
      <header className="role-dashboard-header">
        <Link className="role-dashboard-brand" to="/app/doctor/dashboard">
          ✚ MedCore
        </Link>
        <div className="doctor-header-actions">
          <Link className="doctor-notifications" to="/app/notifications">
            Notifications
          </Link>
          <button className="role-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <section className="role-dashboard-content doctor-content">
        <p className="role-dashboard-eyebrow">CLINICAL WORKSPACE</p>
        <h1>Your clinical dashboard</h1>
        <p className="role-dashboard-description">
          Manage your schedule, follow up on appointments, and continue patient care.
        </p>

        <section className="role-welcome-card doctor-welcome">
          <div className="role-welcome-icon">✚</div>
          <div>
            <h2>
              {loading
                ? "Loading your workspace..."
                : doctor
                  ? `Welcome, Dr. ${doctor.doctorName.replace(/^Dr\.\s*/i, "")}`
                  : "Welcome to MedCore"}
            </h2>
            <p>{doctor?.specialization || "Your appointments and clinical activities, together."}</p>
            {doctor?.departmentName && <p>Department: {doctor.departmentName}</p>}
          </div>
        </section>

        {error && (
          <div className="doctor-alert" role="alert">
            <strong>Unable to load the workspace.</strong>
            <p>{error}</p>
            <button className="doctor-secondary-button" onClick={() => void loadWorkspace()}>
              Try again
            </button>
          </div>
        )}

        <section className="doctor-stats" aria-label="Appointment overview">
          <article className="doctor-stat-card">
            <span className="doctor-stat-icon">-¦</span>
            <p>Today's appointments</p>
            <strong>{loading ? "-" : todaysAppointments.length}</strong>
          </article>
          <article className="doctor-stat-card">
            <span className="doctor-stat-icon">◷</span>
            <p>Awaiting confirmation</p>
            <strong>{loading ? "-" : appointments.filter((a) => a.status === "PENDING").length}</strong>
          </article>
          <article className="doctor-stat-card">
            <span className="doctor-stat-icon">♡</span>
            <p>Consultations in progress</p>
            <strong>{loading ? "-" : appointments.filter((a) => a.status === "IN_PROGRESS").length}</strong>
          </article>
          <article className="doctor-stat-card">
            <span className="doctor-stat-icon">✓</span>
            <p>Completed appointments</p>
            <strong>{loading ? "-" : appointments.filter((a) => a.status === "COMPLETED").length}</strong>
          </article>
        </section>

        <div className="doctor-section-heading">
          <div>
            <h2 className="role-section-title">Appointment schedule</h2>
            <p>Appointments assigned to your doctor profile.</p>
          </div>
          <button
            className="doctor-secondary-button"
            onClick={() => void loadWorkspace()}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        <div className="doctor-filter-row" role="group" aria-label="Filter appointments">
          {[
            { label: "All appointments", value: "ALL" },
            { label: "Today", value: "TODAY" },
            { label: "Upcoming", value: "UPCOMING" },
          ].map((option) => (
            <button
              key={option.value}
              className={`doctor-filter ${filter === option.value ? "active" : ""}`}
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>

        {actionError && <div className="doctor-alert" role="alert">{actionError}</div>}

        {!loading && !error && visibleAppointments.length === 0 && (
          <section className="doctor-empty-state">
            <div className="doctor-empty-icon">-¦</div>
            <h3>No appointments found</h3>
            <p>
              {filter === "TODAY"
                ? "There are no appointments scheduled for today."
                : "Appointments assigned to you will appear here."}
            </p>
          </section>
        )}

        <section id="doctor-appointments" className="doctor-appointment-list" aria-live="polite">
          {visibleAppointments.map((appointment) => {
            const action = nextAction(appointment.status);
            const allowedAction = action && canTransition(appointment.status, action.status);

            return (
              <article className="doctor-appointment-card" key={appointment.id}>
                <div className="doctor-appointment-time">
                  <strong>{formatTime(appointment.startTime)}</strong>
                  <span>{formatDate(appointment.appointmentDate)}</span>
                  <small>{appointment.startTime} – {appointment.endTime}</small>
                </div>

                <div className="doctor-appointment-main">
                  <div className="doctor-patient-heading">
                    <h3>{appointment.patientName || "Patient"}</h3>
                    {appointment.emergency && (
                      <span className="doctor-emergency">Emergency</span>
                    )}
                  </div>
                  <p>{appointment.reason || "No reason provided"}</p>
                  <div className="doctor-appointment-meta">
                    <span className={`doctor-status status-${appointment.status.toLowerCase()}`}>
                      {appointment.status.replaceAll("_", " ")}
                    </span>
                    <span>Patient ID: {appointment.patientId}</span>
                  </div>
                </div>

                <div className="doctor-appointment-actions">
                  {allowedAction && (
                    <button
                      className="doctor-primary-button"
                      disabled={updatingId === appointment.id}
                      onClick={() => void changeStatus(appointment, action.status)}
                    >
                      {updatingId === appointment.id ? "Updating..." : action.label}
                    </button>
                  )}
                  <Link
                    className="doctor-secondary-link"
                    to={`/app/admin/medical-records?patientId=${encodeURIComponent(appointment.patientId)}&appointmentId=${encodeURIComponent(appointment.id)}`}
                  >
                    View Record
                  </Link>
                  {["COMPLETED", "CANCELLED", "NO_SHOW"].includes(appointment.status) && (
                    <span className="doctor-finished-label">No further status actions</span>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <h2 className="role-section-title doctor-profile-title">Clinical tools</h2>
        <div className="role-feature-grid doctor-tool-grid">
          <Link className="role-feature-card" to="/app/admin/medical-records">
            <span className="role-feature-mark">✚</span>
            <h3>Medical records</h3>
            <p>Review and create clinical documentation within your permissions.</p>
          </Link>
          <Link className="role-feature-card" to="/app/admin/laboratory">
            <span className="role-feature-mark">⚕</span>
            <h3>Laboratory</h3>
            <p>Access the laboratory workspace for clinical investigations.</p>
          </Link>
          <article className="role-feature-card">
            <span className="role-feature-mark">♡</span>
            <h3>Doctor profile</h3>
            <p>{doctor?.qualification || "Qualification not added"}{doctor?.experience ? ` · ${doctor.experience} experience` : ""}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
