import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../services/authService";
import {
  createPatient,
  getPatientsByHospital,
  type Patient,
} from "../services/patientService";
import { getHospitals } from "../services/hospitalService";
import type { Hospital } from "../types/hospital";
import "./Patients.css";

interface PatientForm {
  patientNumber: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
}

const emptyForm: PatientForm = {
  patientNumber: "",
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  address: "",
  emergencyContact: "",
};

export default function Patients() {
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<PatientForm>(emptyForm);

  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHospitals() {
      setLoadingHospitals(true);
      setError("");

      try {
        const result = await getHospitals();

        if (cancelled) return;

        setHospitals(result);

        if (result.length > 0) {
          setSelectedHospitalId(result[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load hospitals.",
          );
        }
      } finally {
        if (!cancelled) setLoadingHospitals(false);
      }
    }

    void loadHospitals();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedHospitalId) {
      setPatients([]);
      return;
    }

    let cancelled = false;

    async function loadPatients() {
      setLoadingPatients(true);
      setError("");
      setSuccess("");

      try {
        const result = await getPatientsByHospital(selectedHospitalId);

        if (!cancelled) {
          setPatients(result);
        }
      } catch (err) {
        if (!cancelled) {
          setPatients([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load patient records.",
          );
        }
      } finally {
        if (!cancelled) setLoadingPatients(false);
      }
    }

    void loadPatients();

    return () => {
      cancelled = true;
    };
  }, [selectedHospitalId]);

  function updateField(
    field: keyof PatientForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setFormError("");
    setSuccess("");
  }

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setError("");

    if (!selectedHospitalId) {
      setFormError("Select a hospital before registering a patient.");
      return;
    }

    if (!form.patientNumber.trim()) {
      setFormError("Patient number is required.");
      return;
    }

    if (!form.fullName.trim()) {
      setFormError("Patient name is required.");
      return;
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (form.dateOfBirth && form.dateOfBirth > new Date().toISOString().slice(0, 10)) {
      setFormError("Date of birth cannot be in the future.");
      return;
    }

    setSaving(true);

    try {
      const created = await createPatient({
        hospitalId: selectedHospitalId,
        patientNumber: form.patientNumber.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        bloodGroup: form.bloodGroup || null,
        address: form.address.trim() || null,
        emergencyContact: form.emergencyContact.trim() || null,
      });

      setPatients((current) => [
        created,
        ...current.filter((patient) => patient.id !== created.id),
      ]);

      setForm(emptyForm);
      setShowForm(false);
      setSuccess(`Patient "${created.fullName}" was registered successfully.`);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to register the patient. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedHospital = hospitals.find(
    (hospital) => hospital.id === selectedHospitalId,
  );

  return (
    <main className="patients-page">
      <header className="patients-header">
        <button
          className="patients-brand"
          type="button"
          onClick={() => navigate("/app/admin/dashboard")}
          aria-label="Go to MedCore dashboard"
        >
          <span className="patients-brand-icon">✚</span>
          <span>
            <strong>MedCore</strong>
            <small>Hospital Management System</small>
          </span>
        </button>

        <div className="patients-header-actions">
          <span className="patients-role">ADMINISTRATION</span>
          <button
            className="patients-logout"
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="patients-content">
        <button
          className="patients-back"
          type="button"
          onClick={() => navigate("/app/admin/dashboard")}
        >
          ← Back to dashboard
        </button>

        <section className="patients-intro">
          <div>
            <p className="patients-eyebrow">PATIENT MANAGEMENT</p>
            <h1>Registered patients</h1>
            <p>
              View patient records and register patients at your hospital.
            </p>
          </div>

          <button
            className="patients-primary-button"
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setFormError("");
              setSuccess("");
            }}
            disabled={loadingHospitals || hospitals.length === 0}
          >
            {showForm ? "Cancel registration" : "+ Register patient"}
          </button>
        </section>

        {error && (
          <section className="patients-message patients-message-error" role="alert">
            <strong>Something went wrong</strong>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setSelectedHospitalId((current) => current)}
            >
              Dismiss
            </button>
          </section>
        )}

        {success && (
          <section className="patients-message patients-message-success" role="status">
            <span aria-hidden="true">✓</span>
            {success}
            <button type="button" onClick={() => setSuccess("")}>
              Dismiss
            </button>
          </section>
        )}

        <section className="patients-summary-grid">
          <article className="patients-summary-card">
            <div className="patients-summary-icon">♙</div>
            <div>
              <span>Total patients shown</span>
              <strong>
                {loadingPatients ? "…" : patients.length}
              </strong>
              <small>For the selected hospital</small>
            </div>
          </article>

          <article className="patients-summary-card">
            <div className="patients-summary-icon hospital-summary-icon">✚</div>
            <div>
              <span>Registered hospitals</span>
              <strong>{loadingHospitals ? "…" : hospitals.length}</strong>
              <small>Retrieved from the backend</small>
            </div>
          </article>

          <article className="patients-summary-card">
            <div className="patients-summary-icon status-summary-icon">✓</div>
            <div>
              <span>Selected hospital</span>
              <strong className="patients-hospital-summary">
                {loadingHospitals
                  ? "Loading"
                  : selectedHospital?.name ?? "Not selected"}
              </strong>
              <small>Patient records are filtered by hospital</small>
            </div>
          </article>
        </section>

        {showForm && (
          <section className="patients-panel patients-form-panel">
            <div className="patients-panel-heading">
              <div>
                <h2>Register a patient</h2>
                <p>Fields marked with * are required.</p>
              </div>
            </div>

            {formError && (
              <div className="patients-inline-error" role="alert">
                {formError}
              </div>
            )}

            <form className="patients-form" onSubmit={handleSubmit}>
              <label className="patients-field">
                Hospital *
                <select
                  value={selectedHospitalId}
                  onChange={(event) =>
                    setSelectedHospitalId(event.target.value)
                  }
                  required
                >
                  <option value="">Select a hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="patients-field">
                Patient number *
                <input
                  value={form.patientNumber}
                  onChange={(event) =>
                    updateField("patientNumber", event.target.value)
                  }
                  placeholder="e.g. MC-PAT-002"
                  maxLength={50}
                  required
                />
              </label>

              <label className="patients-field">
                Full name *
                <input
                  value={form.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  placeholder="Enter patient's full name"
                  maxLength={120}
                  required
                />
              </label>

              <label className="patients-field">
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="patient@example.com"
                  maxLength={150}
                />
              </label>

              <label className="patients-field">
                Phone number
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  placeholder="Enter phone number"
                  maxLength={25}
                />
              </label>

              <label className="patients-field">
                Date of birth
                <input
                  type="date"
                  value={form.dateOfBirth}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) =>
                    updateField("dateOfBirth", event.target.value)
                  }
                />
              </label>

              <label className="patients-field">
                Gender
                <select
                  value={form.gender}
                  onChange={(event) =>
                    updateField("gender", event.target.value)
                  }
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="patients-field">
                Blood group
                <select
                  value={form.bloodGroup}
                  onChange={(event) =>
                    updateField("bloodGroup", event.target.value)
                  }
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A−</option>
                  <option value="B+">B+</option>
                  <option value="B-">B−</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB−</option>
                  <option value="O+">O+</option>
                  <option value="O-">O−</option>
                </select>
              </label>

              <label className="patients-field patients-field-wide">
                Address
                <textarea
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  placeholder="Enter patient's address"
                  rows={2}
                  maxLength={500}
                />
              </label>

              <label className="patients-field patients-field-wide">
                Emergency contact
                <input
                  value={form.emergencyContact}
                  onChange={(event) =>
                    updateField("emergencyContact", event.target.value)
                  }
                  placeholder="Emergency contact name and phone"
                  maxLength={150}
                />
              </label>

              <div className="patients-form-actions patients-field-wide">
                <button
                  className="patients-secondary-button"
                  type="button"
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
                  className="patients-primary-button"
                  type="submit"
                  disabled={saving || loadingPatients}
                >
                  {saving ? "Registering…" : "Register patient"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="patients-panel">
          <div className="patients-panel-heading patients-list-heading">
            <div>
              <h2>Patient directory</h2>
              <p>
                {selectedHospital
                  ? `Records for ${selectedHospital.name}`
                  : "Choose a hospital to view patient records"}
              </p>
            </div>

            <label className="patients-hospital-filter">
              <span>Hospital</span>
              <select
                value={selectedHospitalId}
                onChange={(event) =>
                  setSelectedHospitalId(event.target.value)
                }
                disabled={loadingHospitals || hospitals.length === 0}
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

          {loadingHospitals || loadingPatients ? (
            <div className="patients-empty-state">
              <span className="patients-spinner" />
              <p>Loading patient records…</p>
            </div>
          ) : error ? (
            <div className="patients-empty-state">
              <div className="patients-empty-icon">!</div>
              <h3>Patient records unavailable</h3>
              <p>Check the backend connection and try selecting the hospital again.</p>
              <button
                className="patients-secondary-button"
                type="button"
                onClick={() => {
                  setError("");
                  setSelectedHospitalId("");
                  window.setTimeout(() => {
                    setSelectedHospitalId(selectedHospital?.id ?? hospitals[0]?.id ?? "");
                  }, 0);
                }}
              >
                Try again
              </button>
            </div>
          ) : patients.length === 0 ? (
            <div className="patients-empty-state">
              <div className="patients-empty-icon">♙</div>
              <h3>No patients found</h3>
              <p>
                There are no patient records for this hospital yet. Register a
                patient to get started.
              </p>
              <button
                className="patients-primary-button"
                type="button"
                onClick={() => setShowForm(true)}
              >
                + Register first patient
              </button>
            </div>
          ) : (
            <div className="patients-table-wrapper">
              <table className="patients-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Patient number</th>
                    <th>Contact details</th>
                    <th>Gender</th>
                    <th>Blood group</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className="patients-person">
                          <span className="patients-avatar">
                            {patient.fullName.trim().charAt(0).toUpperCase() || "P"}
                          </span>
                          <div>
                            <strong>{patient.fullName}</strong>
                            <small>
                              {patient.dateOfBirth
                                ? `DOB: ${patient.dateOfBirth}`
                                : "Date of birth not provided"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="patients-number">
                          {patient.patientNumber}
                        </span>
                      </td>
                      <td>
                        <div className="patients-contact">
                          <span>{patient.email || "No email provided"}</span>
                          <small>{patient.phone || "No phone provided"}</small>
                        </div>
                      </td>
                      <td>{patient.gender || "—"}</td>
                      <td>
                        {patient.bloodGroup ? (
                          <span className="patients-blood-group">
                            {patient.bloodGroup}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loadingPatients && !loadingHospitals && !error && patients.length > 0 && (
            <div className="patients-table-footer">
              Showing {patients.length}{" "}
              {patients.length === 1 ? "patient" : "patients"}
            </div>
          )}
        </section>

        <footer className="patients-footer">
          MedCore HMS · Patient information is retrieved from the backend.
        </footer>
      </div>
    </main>
  );
}