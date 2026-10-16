import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../services/api";
import { clearAuthSession } from "../services/authService";
import {
  createAppointment,
  getAppointmentsByHospital,
  updateAppointmentStatus,
  type Appointment,
} from "../services/appointmentService";
import { getHospitals } from "../services/hospitalService";
import {
  getPatientsByHospital,
  type Patient,
} from "../services/patientService";
import type { Hospital } from "../types/hospital";
import "./Appointments.css";

interface Doctor {
  id: string;
  fullName?: string;
  name?: string;
  doctorName?: string;
  hospitalId?: string;
  departmentId?: string;
  specialization?: string;
}

interface AppointmentForm {
  doctorId: string;
  patientId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  emergency: boolean;
}

const emptyForm: AppointmentForm = {
  doctorId: "",
  patientId: "",
  appointmentDate: "",
  startTime: "",
  endTime: "",
  reason: "",
  emergency: false,
};

function getDoctorName(doctor: Doctor): string {
  return doctor.fullName || doctor.name || doctor.doctorName || "Doctor";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The request failed. Please try again.";
}

export default function Appointments() {
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalId, setHospitalId] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState<AppointmentForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [appointmentFilter, setAppointmentFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "COMPLETED">("ALL");

  useEffect(() => {
    let cancelled = false;

    async function loadHospitals() {
      try {
        const result = await getHospitals();
        if (cancelled) return;

        setHospitals(result);
        if (result.length > 0) {
          setHospitalId(result[0].id);
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadHospitals();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hospitalId) {
      setDoctors([]);
      setPatients([]);
      setAppointments([]);
      return;
    }

    let cancelled = false;

    async function loadHospitalData() {
      setLoadingAppointments(true);
      setError("");

      const results = await Promise.allSettled([
        apiGet<Doctor[]>(
          `doctors/hospital/${encodeURIComponent(hospitalId)}`,
        ),
        getPatientsByHospital(hospitalId),
        getAppointmentsByHospital(hospitalId),
      ]);

      if (!cancelled) {
        const errors: string[] = [];

        if (results[0].status === "fulfilled") {
          setDoctors(results[0].value);
        } else {
          errors.push(`Doctors: ${getErrorMessage(results[0].reason)}`);
        }

        if (results[1].status === "fulfilled") {
          setPatients(results[1].value);
        } else {
          errors.push(`Patients: ${getErrorMessage(results[1].reason)}`);
        }

        if (results[2].status === "fulfilled") {
          setAppointments(results[2].value);
        } else {
          errors.push(`Appointments: ${getErrorMessage(results[2].reason)}`);
        }

        if (errors.length > 0) {
          setError(errors.join(" | "));
        }
      }

      if (!cancelled) {
        setLoadingAppointments(false);
      }
    }
    void loadHospitalData();

    return () => {
      cancelled = true;
    };
  }, [hospitalId]);

  function changeField<K extends keyof AppointmentForm>(
    field: K,
    value: AppointmentForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
    setSuccess("");
  }

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  async function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setError("");

    if (!hospitalId) {
      setFormError("Select a hospital.");
      return;
    }

    if (!form.doctorId || !form.patientId) {
      setFormError("Select both a doctor and a patient.");
      return;
    }

    if (!form.appointmentDate || !form.startTime || !form.endTime) {
      setFormError("Enter the appointment date, start time, and end time.");
      return;
    }

    if (form.appointmentDate < new Date().toISOString().slice(0, 10)) {
      setFormError("Appointment date cannot be in the past.");
      return;
    }

    if (form.endTime <= form.startTime) {
      setFormError("End time must be later than start time.");
      return;
    }

    if (!form.reason.trim()) {
      setFormError("Enter the reason for the appointment.");
      return;
    }

    setSaving(true);

    try {
      const created = await createAppointment({
        hospitalId,
        doctorId: form.doctorId,
        patientId: form.patientId,
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        endTime: form.endTime,
        reason: form.reason.trim(),
        emergency: form.emergency,
      });

      setAppointments((current) => [
        created,
        ...current.filter((item) => item.id !== created.id),
      ]);
      setForm(emptyForm);
      setShowForm(false);
      setSuccess("Appointment booked successfully.");
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    appointmentId: string,
    status: string,
  ) {
    setUpdatingId(appointmentId);
    setError("");
    setSuccess("");

    try {
      const updated = await updateAppointmentStatus(appointmentId, status);

      setAppointments((current) =>
        current.map((item) =>
          item.id === appointmentId
            ? { ...item, ...updated, status: updated.status || status }
            : item,
        ),
      );

      setSuccess("Appointment status updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId("");
    }
  }

  const pendingCount = appointments.filter(
    (item) => item.status === "PENDING",
  ).length;

  const confirmedCount = appointments.filter(
    (item) => item.status === "CONFIRMED",
  ).length;
  const completedCount = appointments.filter(
    (item) => item.status === "COMPLETED",
  ).length;

  const filteredAppointments = appointments.filter(
    (item) =>
      appointmentFilter === "ALL" ||
      item.status === appointmentFilter,
  );

  const selectedHospital = hospitals.find(
    (item) => item.id === hospitalId,
  );

  return (
    <main className="appointments-page">
      <header className="appointments-header">
        <button
          className="appointments-brand"
          type="button"
          onClick={() => navigate("/app/admin/dashboard")}
        >
          <span className="appointments-brand-icon">{"\u2695"}</span>
          <span>
            <strong>MedCore</strong>
            <small>Hospital Management System</small>
          </span>
        </button>

        <div className="appointments-header-actions">
          <span className="appointments-role">ADMINISTRATION</span>
          <button className="appointments-logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="appointments-content">
        <button
          className="appointments-back"
          onClick={() => navigate("/app/admin/dashboard")}
        >
          {"← Back to Dashboard"}
        </button>

        <section className="appointments-intro">
          <div>
            <p className="appointments-eyebrow">CLINICAL OPERATIONS</p>
            <h1>Appointments</h1>
            <p>Manage bookings and appointment status for your hospital.</p>
          </div>

          <button
            className="appointments-primary"
            onClick={() => {
              setShowForm((current) => !current);
              setFormError("");
              setSuccess("");
            }}
            disabled={loading || hospitals.length === 0}
          >
            {showForm ? "Cancel booking" : "+ Book appointment"}
          </button>
        </section>

        {error && (
          <div className="appointments-alert appointments-alert-error" role="alert">
            <span>{error}</span>
            <button onClick={() => setError("")}>Dismiss</button>
          </div>
        )}

        {success && (
          <div className="appointments-alert appointments-alert-success" role="status">
            <span>\u2713 {success}</span>
            <button onClick={() => setSuccess("")}>Dismiss</button>
          </div>
        )}

        <section className="appointments-stats" aria-label="Appointment summary">
          <button type="button" className={`appointments-stat ${appointmentFilter === "ALL" ? "appointment-stat-active" : ""}`} aria-pressed={appointmentFilter === "ALL"} onClick={() => setAppointmentFilter("ALL")}>
            <span className="appointments-stat-icon">{"\u25A6"}</span>
            <div><small>Total appointments</small><strong>{loadingAppointments ? "\u2026" : appointments.length}</strong></div>
          </button>
          <button type="button" className={`appointments-stat ${appointmentFilter === "PENDING" ? "appointment-stat-active" : ""}`} aria-pressed={appointmentFilter === "PENDING"} onClick={() => setAppointmentFilter("PENDING")}>
            <span className="appointments-stat-icon pending-icon">{"\u25CB"}</span>
            <div><small>Pending</small><strong>{loadingAppointments ? "\u2026" : pendingCount}</strong></div>
          </button>
          <button type="button" className={`appointments-stat ${appointmentFilter === "CONFIRMED" ? "appointment-stat-active" : ""}`} aria-pressed={appointmentFilter === "CONFIRMED"} onClick={() => setAppointmentFilter("CONFIRMED")}>
            <span className="appointments-stat-icon confirmed-icon">{"\u2713"}</span>
            <div><small>Confirmed</small><strong>{loadingAppointments ? "\u2026" : confirmedCount}</strong></div>
          </button>
          <button type="button" className={`appointments-stat ${appointmentFilter === "COMPLETED" ? "appointment-stat-active" : ""}`} aria-pressed={appointmentFilter === "COMPLETED"} onClick={() => setAppointmentFilter("COMPLETED")}>
            <span className="appointments-stat-icon completed-icon">{"\u2714"}</span>
            <div><small>Completed</small><strong>{loadingAppointments ? "\u2026" : completedCount}</strong></div>
          </button>
        </section>
        <section className="appointments-panel">
          <div className="appointments-panel-heading">
            <div>
              <h2>Hospital workspace</h2>
              <p>Select a hospital to manage its appointments.</p>
            </div>

            <label className="appointments-hospital-select">
              <span>Hospital</span>
              <select
                value={hospitalId}
                onChange={(event) => setHospitalId(event.target.value)}
                disabled={loading || hospitals.length === 0}
              >
                {hospitals.length === 0 && (
                  <option value="">No hospitals available</option>
                )}
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {showForm && (
            <form className="appointments-form" onSubmit={handleBooking}>
              <div className="appointments-form-heading">
                <h3>Book a new appointment</h3>
                <p>Complete the details below. The backend validates scheduling conflicts.</p>
              </div>

              {formError && (
                <div className="appointments-inline-error" role="alert">
                  {formError}
                </div>
              )}

              <div className="appointments-form-grid">
                <label>
                  Patient *
                  <select
                    value={form.patientId}
                    onChange={(event) =>
                      changeField("patientId", event.target.value)
                    }
                    required
                  >
                    <option value="">Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.fullName} ({patient.patientNumber})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Doctor *
                  <select
                    value={form.doctorId}
                    onChange={(event) =>
                      changeField("doctorId", event.target.value)
                    }
                    required
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {getDoctorName(doctor)}
                        {doctor.specialization
                          ? ` \u2014 ${doctor.specialization}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Appointment date *
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.appointmentDate}
                    onChange={(event) =>
                      changeField("appointmentDate", event.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Start time *
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(event) =>
                      changeField("startTime", event.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  End time *
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) =>
                      changeField("endTime", event.target.value)
                    }
                    required
                  />
                </label>

                <label className="appointments-reason-field">
                  Reason for appointment *
                  <textarea
                    value={form.reason}
                    onChange={(event) =>
                      changeField("reason", event.target.value)
                    }
                    placeholder="Briefly describe the reason for the visit"
                    rows={2}
                    maxLength={500}
                    required
                  />
                </label>

                <label className="appointments-emergency-field">
                  <input
                    type="checkbox"
                    checked={form.emergency}
                    onChange={(event) =>
                      changeField("emergency", event.target.checked)
                    }
                  />
                  <span>
                    <strong>Emergency appointment</strong>
                    <small>Mark this booking as an emergency.</small>
                  </span>
                </label>
              </div>

              {doctors.length === 0 && (
                <p className="appointments-form-note">
                  No doctors are available for this hospital. Add a doctor before booking.
                </p>
              )}

              {patients.length === 0 && (
                <p className="appointments-form-note">
                  No patients are available for this hospital. Register a patient before booking.
                </p>
              )}

              <div className="appointments-form-actions">
                <button
                  type="button"
                  className="appointments-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                    setFormError("");
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="appointments-primary"
                  disabled={saving || doctors.length === 0 || patients.length === 0}
                >
                  {saving ? "Booking\u2026" : "Confirm booking"}
                </button>
              </div>
            </form>
          )}

          <div className="appointments-list-heading">
            <div>
              <h2>Appointment directory</h2>
              <p>
                {selectedHospital
                  ? selectedHospital.name
                  : "Choose a hospital"}
              </p>
            </div>
            <span className="appointments-record-count">
              {appointments.length} records
            </span>
          </div>

          {loading || loadingAppointments ? (
            <div className="appointments-empty">
              <span className="appointments-spinner" />
              <p>Loading appointments\u2026</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="appointments-empty">
              <span className="appointments-empty-icon">\u25A6</span>
              <h3>No appointments yet</h3>
              <p>Book the first appointment to begin managing the schedule.</p>
              <button
                className="appointments-primary"
                onClick={() => setShowForm(true)}
                disabled={!hospitalId}
              >
                + Book appointment
              </button>
            </div>
          ) : (
            <div className="appointments-table-wrap">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Update status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => {
                    const patient = patients.find(
                      (item) => item.id === appointment.patientId,
                    );
                    const doctor = doctors.find(
                      (item) => item.id === appointment.doctorId,
                    );

                    return (
                      <tr key={appointment.id}>
                        <td>
                          <strong>
                            {appointment.patientName ||
                              patient?.fullName ||
                              "Patient"}
                          </strong>
                          <small className="appointments-subtext">
                            {patient?.patientNumber || ""}
                          </small>
                        </td>
                        <td>
                          <strong>
                            {appointment.doctorName ||
                              (doctor ? getDoctorName(doctor) : "Doctor")}
                          </strong>
                          <small className="appointments-subtext">
                            {doctor?.specialization || ""}
                          </small>
                        </td>
                        <td>
                          <strong>{appointment.appointmentDate}</strong>
                          <small className="appointments-subtext">
                            {appointment.startTime} \u2013 {appointment.endTime}
                          </small>
                        </td>
                        <td>
                          <span className="appointments-reason">
                            {appointment.reason || "\u2014"}
                          </span>
                          {appointment.emergency && (
                            <span className="appointments-emergency-tag">
                              Emergency
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`appointments-status status-${appointment.status.toLowerCase()}`}
                          >
                            {appointment.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td>
                          <select
                            className="appointments-status-select"
                            value={appointment.status}
                            disabled={updatingId === appointment.id}
                            onChange={(event) =>
                              void handleStatusChange(
                                appointment.id,
                                event.target.value,
                              )
                            }
                            aria-label={`Update status for appointment ${appointment.id}`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="appointments-footer">
          MedCore HMS \u00B7 Appointment data is loaded from the backend.
        </footer>
      </div>
    </main>
  );
}
