import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getMyPatientProfile, type Patient } from "../services/patientService";
import {
  getDoctorsByHospital,
  getDoctorAvailability,
  type Doctor,
  type DoctorAvailability,
} from "../services/doctorService";
import {
  createAppointment,
  type AppointmentRequest,
} from "../services/appointmentService";
import "./PatientDoctorDirectory.css";

interface DoctorListing {
  doctor: Doctor;
  availability: DoctorAvailability[];
}

function todayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTimeString(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hours}:${mins}:00`;
}

function formatTime(time: string): string {
  const [hours = "0", minutes = "00"] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDay(day: string): string {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

export default function PatientDoctorDirectory() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [listings, setListings] = useState<DoctorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorListing | null>(null);
  const [appointmentDate, setAppointmentDate] = useState(todayString());
  const [startTime, setStartTime] = useState("");
  const [reason, setReason] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDirectory() {
      try {
        setLoading(true);
        setError("");

        const profile = await getMyPatientProfile();
        if (!active) return;
        setPatient(profile);

        const doctors = await getDoctorsByHospital(profile.hospitalId);
        const results = await Promise.all(
          doctors.map(async (doctor) => {
            try {
              const availability = await getDoctorAvailability(doctor.id);
              return { doctor, availability };
            } catch {
              return { doctor, availability: [] };
            }
          }),
        );

        if (active) setListings(results);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load doctors. Please try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDirectory();
    return () => {
      active = false;
    };
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return listings;

    return listings.filter(({ doctor }) =>
      [
        doctor.doctorName,
        doctor.specialization,
        doctor.departmentName,
        doctor.qualification,
        doctor.experience,
      ].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [listings, search]);

  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !appointmentDate) return [];

    // Use local midday to avoid timezone shifting the selected calendar date.
    const selectedDate = new Date(`${appointmentDate}T12:00:00`);
    const weekday = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ][selectedDate.getDay()];

    const schedule = selectedDoctor.availability.filter(
      (item) => item.available && item.dayOfWeek.toUpperCase() === weekday,
    );

    const slots: string[] = [];
    const now = new Date();

    for (const item of schedule) {
      const start = toMinutes(item.startTime);
      const end = toMinutes(item.endTime);

      for (let slot = start; slot + 30 <= end; slot += 30) {
        const candidate = toTimeString(slot);

        if (
          appointmentDate !== todayString() ||
          slot > now.getHours() * 60 + now.getMinutes()
        ) {
          slots.push(candidate);
        }
      }
    }

    return [...new Set(slots)].sort();
  }, [selectedDoctor, appointmentDate]);

  function openBooking(listing: DoctorListing) {
    setSelectedDoctor(listing);
    setAppointmentDate(todayString());
    setStartTime("");
    setReason("");
    setEmergency(false);
    setBookingMessage("");
    setBookingError("");
  }

  async function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingMessage("");
    setBookingError("");

    if (!patient || !selectedDoctor) {
      setBookingError("Your patient profile or selected doctor is unavailable.");
      return;
    }

    if (!startTime || !availableSlots.includes(startTime)) {
      setBookingError("Please select an available time from the schedule.");
      return;
    }

    const request: AppointmentRequest = {
      hospitalId: patient.hospitalId,
      doctorId: selectedDoctor.doctor.id,
      patientId: patient.id,
      appointmentDate,
      startTime,
      endTime: toTimeString(toMinutes(startTime) + 30),
      reason: reason.trim(),
      emergency,
    };

    try {
      setBooking(true);
      await createAppointment(request);
      setBookingMessage(
        "Appointment request submitted successfully. Check your Appointments page for its current status.",
      );
      setSelectedDoctor(null);
    } catch (err) {
      setBookingError(
        err instanceof Error
          ? err.message
          : "Booking failed. The selected time may no longer be available.",
      );
    } finally {
      setBooking(false);
    }
  }

  return (
    <main className="doctor-directory-page">
      <div className="doctor-directory-container">
        <Link className="doctor-directory-back" to="/app/patient/dashboard">
          ← Back to dashboard
        </Link>

        <header className="doctor-directory-hero">
          <span className="doctor-directory-eyebrow">YOUR CARE, YOUR CHOICE</span>
          <h1>Find your doctor</h1>
          <p>
            Explore doctors at your hospital, check their weekly schedules,
            and request an appointment that works for you.
          </p>

          <label className="doctor-directory-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by doctor, specialty or department..."
              aria-label="Search doctors"
            />
          </label>

          <div className="doctor-directory-count">
            {loading
              ? "Loading doctor directory..."
              : `${filteredDoctors.length} doctor${filteredDoctors.length === 1 ? "" : "s"} found`}
          </div>
        </header>

        {error && (
          <div className="doctor-directory-alert" role="alert">
            <strong>Unable to load the directory</strong>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {bookingMessage && (
          <div className="doctor-directory-success" role="status">
            <strong>Request submitted</strong>
            <p>{bookingMessage}</p>
            <Link to="/app/appointments">View my appointments →</Link>
          </div>
        )}

        {loading && (
          <div className="doctor-directory-empty" role="status">
            <span className="doctor-directory-loader" />
            <h2>Finding your care team</h2>
            <p>Loading doctors and their configured schedules...</p>
          </div>
        )}

        {!loading && !error && filteredDoctors.length === 0 && (
          <div className="doctor-directory-empty">
            <span className="doctor-directory-empty-icon">⌕</span>
            <h2>{search ? "No matching doctors" : "No doctors listed yet"}</h2>
            <p>
              {search
                ? "Try a different name, specialty or department."
                : "There are currently no doctors registered for your hospital."}
            </p>
          </div>
        )}

        {!loading && filteredDoctors.length > 0 && (
          <section className="doctor-directory-grid" aria-label="Doctors">
            {filteredDoctors.map(({ doctor, availability }) => (
              <article className="doctor-directory-card" key={doctor.id}>
                <div className="doctor-directory-card-top">
                  <div className="doctor-directory-avatar" aria-hidden="true">
                    {doctor.doctorName?.replace(/^Dr\.?\s*/i, "").charAt(0).toUpperCase() || "D"}
                  </div>
                  <span className="doctor-directory-specialty">
                    {doctor.specialization || "General care"}
                  </span>
                </div>

                <h2>{doctor.doctorName}</h2>
                <p className="doctor-directory-department">
                  {doctor.departmentName || "Hospital department"}
                </p>

                <div className="doctor-directory-credentials">
                  <div>
                    <span>QUALIFICATION</span>
                    <p>{doctor.qualification || "Not provided"}</p>
                  </div>
                  <div>
                    <span>EXPERIENCE</span>
                    <p>{doctor.experience || "Not provided"}</p>
                  </div>
                </div>

                {doctor.bio && <p className="doctor-directory-bio">{doctor.bio}</p>}

                <div className="doctor-directory-schedule">
                  <span className="doctor-directory-schedule-title">
                    WEEKLY AVAILABILITY
                  </span>
                  {availability.filter((item) => item.available).length === 0 ? (
                    <p>Schedule not configured</p>
                  ) : (
                    availability
                      .filter((item) => item.available)
                      .map((item) => (
                        <p key={item.id}>
                          <strong>{formatDay(item.dayOfWeek)}</strong>
                          <span>
                            {formatTime(item.startTime)} – {formatTime(item.endTime)}
                          </span>
                        </p>
                      ))
                  )}
                </div>

                <button
                  className="doctor-directory-book-button"
                  type="button"
                  onClick={() => openBooking({ doctor, availability })}
                >
                  Request appointment <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </section>
        )}

        {selectedDoctor && (
          <div
            className="doctor-booking-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !booking) {
                setSelectedDoctor(null);
              }
            }}
          >
            <section
              className="doctor-booking-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="doctor-booking-title"
            >
              <button
                className="doctor-booking-close"
                type="button"
                aria-label="Close booking form"
                disabled={booking}
                onClick={() => setSelectedDoctor(null)}
              >
                ×
              </button>

              <span className="doctor-directory-eyebrow">APPOINTMENT REQUEST</span>
              <h2 id="doctor-booking-title">{selectedDoctor.doctor.doctorName}</h2>
              <p className="doctor-booking-subtitle">
                {selectedDoctor.doctor.specialization} · 30-minute appointment
              </p>

              <form onSubmit={handleBooking} className="doctor-booking-form">
                <label>
                  Appointment date
                  <input
                    type="date"
                    min={todayString()}
                    required
                    value={appointmentDate}
                    onChange={(event) => {
                      setAppointmentDate(event.target.value);
                      setStartTime("");
                      setBookingError("");
                    }}
                  />
                </label>

                <label>
                  Available start time
                  <select
                    required
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  >
                    <option value="">Choose a time</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {formatTime(slot)}
                      </option>
                    ))}
                  </select>
                </label>

                {appointmentDate && availableSlots.length === 0 && (
                  <p className="doctor-booking-hint">
                    No configured time slots are available on this date. Try
                    another date based on the doctor's weekly schedule.
                  </p>
                )}

                <label>
                  Reason for visit
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Briefly describe why you want to consult the doctor"
                  />
                </label>

                <label className="doctor-booking-emergency">
                  <input
                    type="checkbox"
                    checked={emergency}
                    onChange={(event) => setEmergency(event.target.checked)}
                  />
                  Mark this request as an emergency
                </label>

                {emergency && (
                  <p className="doctor-booking-hint">
                    This flag does not provide emergency care or guarantee
                    priority. For a medical emergency, contact local emergency
                    services or go to the nearest emergency department.
                  </p>
                )}

                {bookingError && (
                  <div className="doctor-booking-error" role="alert">
                    {bookingError}
                  </div>
                )}

                <button
                  className="doctor-directory-book-button"
                  type="submit"
                  disabled={booking || availableSlots.length === 0}
                >
                  {booking ? "Submitting request..." : "Confirm appointment request"}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
