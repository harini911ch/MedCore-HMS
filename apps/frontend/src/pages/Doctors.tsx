import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getHospitals } from "../services/hospitalService";
import type { Hospital } from "../types/hospital";
import {
  createDoctor,
  getDoctorsByHospital,
  type Doctor,
  type DoctorRequest,
} from "../services/doctorService";
import "./Doctors.css";

const blankForm: DoctorRequest = {
  userId: "",
  departmentId: "",
  hospitalId: "",
  specialization: "",
  licenseNumber: "",
  qualification: "",
  experience: "",
  bio: "",
};

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase() || "DR";
}

export default function Doctors() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalId, setHospitalId] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState<DoctorRequest>(blankForm);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSummary, setActiveSummary] = useState<"doctors" | "specialties" | "departments" | null>(null);

  useEffect(() => {
    let active = true;
    getHospitals()
      .then((items) => {
        if (!active) return;
        setHospitals(items);
        if (items.length) {
          setHospitalId(items[0].id);
          setForm((current) => ({ ...current, hospitalId: items[0].id }));
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load hospitals.");
      })
      .finally(() => { if (active) setLoadingHospitals(false); });
    return () => { active = false; };
  }, []);

  async function refreshDoctors(id: string) {
    if (!id) { setDoctors([]); return; }
    setLoadingDoctors(true);
    setError("");
    try {
      setDoctors(await getDoctorsByHospital(id));
    } catch (err) {
      setDoctors([]);
      setError(err instanceof Error ? err.message : "Unable to load doctors.");
    } finally {
      setLoadingDoctors(false);
    }
  }

  useEffect(() => {
    void refreshDoctors(hospitalId);
  }, [hospitalId]);

  const specialties = useMemo(
    () => Array.from(new Set(doctors.map((doctor) => doctor.specialization?.trim()).filter((value): value is string => Boolean(value)))).sort(),
    [doctors],
  );

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesSearch = !query || [
        doctor.doctorName, doctor.specialization, doctor.departmentName,
        doctor.qualification, doctor.licenseNumber,
      ].some((value) => value?.toLowerCase().includes(query));
      const matchesSpecialty = specialty === "all" || doctor.specialization === specialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, specialty]);

  function updateForm<K extends keyof DoctorRequest>(key: K, value: DoctorRequest[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    if (!hospitalId) {
      setFormError("Create or select a hospital before registering a doctor.");
      return;
    }
    if (!form.userId.trim() || !form.departmentId.trim()) {
      setFormError("User ID and Department ID are required. Use existing IDs from your backend.");
      return;
    }
    setSaving(true);
    try {
      const created = await createDoctor({
        ...form,
        userId: form.userId.trim(),
        departmentId: form.departmentId.trim(),
        hospitalId,
        specialization: form.specialization.trim(),
        licenseNumber: form.licenseNumber.trim(),
        qualification: form.qualification.trim(),
        experience: form.experience.trim(),
        bio: form.bio.trim(),
      });
      setDoctors((current) => [created, ...current]);
      setForm({ ...blankForm, hospitalId });
      setShowForm(false);
      setSuccess(`${created.doctorName || "Doctor"} was registered successfully.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to register doctor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="doctors-page">
      <div className="doctors-glow doctors-glow-one" aria-hidden="true" />
      <div className="doctors-glow doctors-glow-two" aria-hidden="true" />
      <header className="doctors-header">
        <div>
          <div className="doctors-eyebrow"><span className="doctors-eyebrow-dot" /> CARE TEAM DIRECTORY</div>
          <h1>Doctors <span>& Specialists</span></h1>
          <p>Manage your hospital’s medical team and keep specialist information organized.</p>
        </div>
        <div className="doctors-header-actions">
          <label className="doctors-hospital-picker">
            <span>HOSPITAL</span>
            <select value={hospitalId} disabled={loadingHospitals || !hospitals.length} onChange={(event) => {
              setHospitalId(event.target.value);
              setForm((current) => ({ ...current, hospitalId: event.target.value }));
            }}>
              {loadingHospitals && <option value="">Loading hospitals…</option>}
              {!loadingHospitals && !hospitals.length && <option value="">No hospitals found</option>}
              {hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
            </select>
          </label>
          <button className="doctors-primary-btn" onClick={() => { setShowForm((value) => !value); setFormError(""); setSuccess(""); }}>
            <span className="doctors-plus">{showForm ? "−" : "+"}</span>{showForm ? "Close form" : "Register doctor"}
          </button>
        </div>
      </header>

      {error && <div className="doctors-alert doctors-alert-error" role="alert"><span>!</span><div><strong>Couldn’t load the directory</strong><p>{error}</p><button onClick={() => void refreshDoctors(hospitalId)}>Try again</button></div></div>}
      {success && <div className="doctors-alert doctors-alert-success" role="status"><span>✓</span>{success}<button aria-label="Dismiss message" onClick={() => setSuccess("")}>×</button></div>}

      <section className="doctors-stats" aria-label="Doctor directory summary">
  <button type="button" className="doctors-stat-card doctors-stat-clickable"
    onClick={() => document.getElementById("doctors-directory")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
    <div className="doctors-stat-icon doctors-icon-blue">✚</div>
    <div><span>REGISTERED DOCTORS</span><strong>{loadingDoctors ? "—" : doctors.length}</strong><small>View doctor directory →</small></div>
    <div className="doctors-stat-mark">01</div>
  </button>
  <button type="button" className="doctors-stat-card doctors-stat-clickable"
    onClick={() => setActiveSummary("specialties")}>
    <div className="doctors-stat-icon doctors-icon-purple">⌘</div>
    <div><span>SPECIALTIES</span><strong>{loadingDoctors ? "—" : specialties.length}</strong><small>Explore specialties →</small></div>
    <div className="doctors-stat-mark">02</div>
  </button>
  <button type="button" className="doctors-stat-card doctors-stat-clickable"
    onClick={() => setActiveSummary("departments")}>
    <div className="doctors-stat-icon doctors-icon-teal">▤</div>
    <div><span>DEPARTMENTS</span><strong>{loadingDoctors ? "—" : new Set(doctors.map((doctor) => doctor.departmentId)).size}</strong><small>Explore departments →</small></div>
    <div className="doctors-stat-mark">03</div>
  </button>
</section>

{activeSummary && (
  <div className="doctors-summary-overlay" onClick={() => setActiveSummary(null)}>
    <section className="doctors-summary-modal" role="dialog" aria-modal="true"
      aria-labelledby="doctors-summary-title" onClick={(event) => event.stopPropagation()}>
      <header className="doctors-summary-modal-header">
        <div>
          <span className="doctors-kicker">MEDCORE CARE TEAM</span>
          <h2 id="doctors-summary-title">
            {activeSummary === "specialties" ? "Medical specialties" : "Hospital departments"}
          </h2>
          <p>
            {activeSummary === "specialties"
              ? `${specialties.length} specialty type(s) in this hospital`
              : `${new Set(doctors.map((doctor) => doctor.departmentId)).size} department(s) represented`}
          </p>
        </div>
        <button type="button" className="doctors-summary-close"
          onClick={() => setActiveSummary(null)} aria-label="Close">×</button>
      </header>

      <div className="doctors-summary-list">
        {loadingDoctors ? (
          <p className="doctors-summary-empty">Loading directory…</p>
        ) : activeSummary === "specialties" ? (
          specialties.length ? specialties.map((item) => (
            <button type="button" className="doctors-summary-item" key={item}
              onClick={() => {
                setSpecialty(item);
                setActiveSummary(null);
                window.setTimeout(() => document.getElementById("doctors-directory")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
              }}>
              <span className="doctors-summary-item-icon">✚</span>
              <span><strong>{item}</strong><small>{doctors.filter((doctor) => doctor.specialization?.trim() === item).length} doctor(s)</small></span>
              <span className="doctors-summary-arrow">→</span>
            </button>
          )) : <p className="doctors-summary-empty">No specialties are available yet.</p>
        ) : (
          Array.from(new Set(doctors.map((doctor) => doctor.departmentName?.trim() || "Department not set"))).map((department) => {
            const members = doctors.filter((doctor) => (doctor.departmentName?.trim() || "Department not set") === department);
            return (
              <article className="doctors-summary-department" key={department}>
                <div className="doctors-summary-department-heading">
                  <strong>{department}</strong>
                  <span>{members.length} doctor(s)</span>
                </div>
                {members.map((doctor) => (
                  <div className="doctors-summary-doctor" key={doctor.id}>
                    <span className="doctors-avatar">{initials(doctor.doctorName || "Doctor")}</span>
                    <div><strong>{doctor.doctorName || "Unnamed doctor"}</strong>
                      <small>{doctor.specialization || "Specialty not specified"}</small>
                    </div>
                  </div>
                ))}
              </article>
            );
          })
        )}
        {!loadingDoctors && activeSummary === "departments" && doctors.length === 0 && (
          <p className="doctors-summary-empty">No doctors or departments are registered yet.</p>
        )}
      </div>
      <footer className="doctors-summary-footer">
        <button type="button" className="doctors-secondary-btn" onClick={() => setActiveSummary(null)}>Close</button>
      </footer>
    </section>
  </div>
)}

      {showForm && <section className="doctors-form-card">
        <div className="doctors-section-heading"><div><span className="doctors-kicker">NEW TEAM MEMBER</span><h2>Register a doctor</h2><p>Enter the existing user and department IDs to link the doctor to your hospital.</p></div><span className="doctors-form-symbol">＋</span></div>
        <form className="doctors-form" onSubmit={handleCreate}>
          <label>User ID <input required value={form.userId} onChange={(event) => updateForm("userId", event.target.value)} placeholder="Existing user UUID" /></label>
          <label>Department ID <input required value={form.departmentId} onChange={(event) => updateForm("departmentId", event.target.value)} placeholder="Existing department UUID" /></label>
          <label>Specialization <input required value={form.specialization} onChange={(event) => updateForm("specialization", event.target.value)} placeholder="e.g. Cardiology" /></label>
          <label>Medical license number <input required value={form.licenseNumber} onChange={(event) => updateForm("licenseNumber", event.target.value)} placeholder="License number" /></label>
          <label>Qualification <input value={form.qualification} onChange={(event) => updateForm("qualification", event.target.value)} placeholder="e.g. MBBS, MD" /></label>
          <label>Experience <input value={form.experience} onChange={(event) => updateForm("experience", event.target.value)} placeholder="e.g. 8 years" /></label>
          <label className="doctors-form-wide">Professional bio <textarea rows={3} value={form.bio} onChange={(event) => updateForm("bio", event.target.value)} placeholder="Short professional introduction (optional)" /></label>
          {formError && <div className="doctors-form-error" role="alert">{formError}</div>}
          <div className="doctors-form-actions"><button type="button" className="doctors-secondary-btn" onClick={() => { setShowForm(false); setFormError(""); }}>Cancel</button><button type="submit" className="doctors-primary-btn" disabled={saving || !hospitalId}>{saving ? "Registering…" : "Register doctor"}</button></div>
        </form>
      </section>}

      <section className="doctors-directory-card" id="doctors-directory">
        <div className="doctors-section-heading doctors-directory-heading"><div><span className="doctors-kicker">HOSPITAL STAFF</span><h2>Doctor directory</h2><p>Search profiles by name, department, qualification or specialty.</p></div><span className="doctors-count-pill">{filteredDoctors.length} {filteredDoctors.length === 1 ? "doctor" : "doctors"}</span></div>
        <div className="doctors-toolbar">
          <label className="doctors-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search doctors, specialties…" aria-label="Search doctors" /><kbd>⌘ K</kbd></label>
          <label className="doctors-filter"><span>Specialty</span><select value={specialty} onChange={(event) => setSpecialty(event.target.value)}><option value="all">All specialties</option>{specialties.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button className="doctors-refresh-btn" onClick={() => void refreshDoctors(hospitalId)} disabled={loadingDoctors} title="Refresh directory" aria-label="Refresh directory">{loadingDoctors ? "…" : "↻"}</button>
        </div>
        {loadingDoctors ? <div className="doctors-loading"><span className="doctors-spinner" /><strong>Loading doctor directory</strong><p>Connecting to your hospital records…</p></div>
        : filteredDoctors.length === 0 ? <div className="doctors-empty"><div className="doctors-empty-icon">✚</div><h3>{doctors.length ? "No matching doctors" : "Your directory is ready"}</h3><p>{doctors.length ? "Try another name or specialty, or clear your filters." : "No doctors are registered for this hospital yet. Register a doctor to start building your care team."}</p>{doctors.length > 0 ? <button className="doctors-secondary-btn" onClick={() => { setSearch(""); setSpecialty("all"); }}>Clear filters</button> : <button className="doctors-primary-btn" onClick={() => setShowForm(true)}>＋ Register first doctor</button>}</div>
        : <div className="doctors-table-wrap"><table className="doctors-table"><thead><tr><th>DOCTOR</th><th>DEPARTMENT</th><th>SPECIALIZATION</th><th>QUALIFICATION</th><th>LICENSE</th></tr></thead><tbody>{filteredDoctors.map((doctor, index) => <tr key={doctor.id} style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}><td><div className="doctors-person"><div className="doctors-avatar" aria-hidden="true">{initials(doctor.doctorName || "Doctor")}</div><div><strong>{doctor.doctorName || "Unnamed doctor"}</strong><small>{doctor.experience || "Experience not provided"}</small></div></div></td><td><span className="doctors-department">{doctor.departmentName || "Department not set"}</span></td><td><span className="doctors-specialty">{doctor.specialization || "—"}</span></td><td>{doctor.qualification || "—"}</td><td><span className="doctors-license">{doctor.licenseNumber || "—"}</span></td></tr>)}</tbody></table></div>}
        <footer className="doctors-card-footer"><span><span className="doctors-live-dot" /> Live directory from MedCore API</span><span>Showing {filteredDoctors.length} of {doctors.length} doctors</span></footer>
      </section>
      <p className="doctors-page-footnote">MEDCORE HMS <span>•</span> Care teams, connected.</p>
    </main>
  );
}
