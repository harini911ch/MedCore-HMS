import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPatientProfile, type Patient } from "../services/patientService";
import {
  getPatientInvoices,
  type Invoice,
} from "../services/billingService";
import "./RoleDashboard.css";
import "./PatientWorkspace.css";

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);

export default function PatientBilling() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const profile = await getMyPatientProfile();
        if (!active) return;
        setPatient(profile);

        const result = await getPatientInvoices(profile.id);
        if (!active) return;
        setInvoices(result);
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load your invoices.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  const totalBilled = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
  const totalDue = invoices.reduce((sum, invoice) => sum + invoice.amountDue, 0);

  return (
    <main className="role-dashboard">
      <header className="role-dashboard-header">
        <Link className="role-dashboard-brand" to="/app/patient/dashboard">MedCore</Link>
        <nav className="patient-workspace-nav" aria-label="Patient navigation">
          <Link to="/app/patient/dashboard">Dashboard</Link>
          <Link to="/app/appointments">Appointments</Link>
          <Link to="/app/medical-records">Medical records</Link>
          <Link to="/app/billing" aria-current="page">Billing</Link>
        </nav>
      </header>

      <section className="role-dashboard-content">
        <p className="role-dashboard-eyebrow">YOUR HEALTHCARE SPACE</p>
        <h1>My Billing</h1>
        <p className="role-dashboard-description">
          Review your invoices, payments and remaining balances.
        </p>

        <section className="role-welcome-card">
          <div className="role-welcome-icon">INR</div>
          <div>
            <h2>{patient ? `Hello, ${patient.fullName}` : "Your invoices"}</h2>
            <p>Patient ID: {patient?.patientNumber ?? "Loading..."}</p>
          </div>
        </section>

        {loading && <div className="patient-workspace-message">Loading your billing information...</div>}

        {error && (
          <div className="patient-workspace-message patient-workspace-error" role="alert">
            <strong>Unable to load billing information.</strong>
            <p>{error}</p>
            <p>Please sign in again if your session has expired.</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="patient-billing-summary">
              <article className="patient-billing-stat">
                <span>Total billed</span>
                <strong>{money(totalBilled)}</strong>
              </article>
              <article className="patient-billing-stat">
                <span>Amount paid</span>
                <strong>{money(totalPaid)}</strong>
              </article>
              <article className="patient-billing-stat">
                <span>Amount due</span>
                <strong>{money(totalDue)}</strong>
              </article>
            </div>

            {invoices.length === 0 ? (
              <div className="patient-workspace-empty">
                <h2>No invoices yet</h2>
                <p>Your invoices will appear here when they are available.</p>
              </div>
            ) : (
              <div className="patient-record-list">
                {invoices.map((invoice) => (
                  <article className="patient-record-card" key={invoice.id}>
                    <div className="patient-appointment-top">
                      <div>
                        <p className="patient-workspace-label">INVOICE</p>
                        <h2>{invoice.invoiceNumber}</h2>
                      </div>
                      <span className={`patient-status patient-status-${invoice.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                        {invoice.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="patient-record-grid">
                      <div><span className="patient-workspace-label">DATE</span><p>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString("en-IN") : "Not recorded"}</p></div>
                      <div><span className="patient-workspace-label">TOTAL</span><p>{money(invoice.total)}</p></div>
                      <div><span className="patient-workspace-label">PAID</span><p>{money(invoice.amountPaid)}</p></div>
                      <div><span className="patient-workspace-label">AMOUNT DUE</span><p>{money(invoice.amountDue)}</p></div>
                    </div>

                    {invoice.items?.length > 0 && (
                      <div className="patient-invoice-items">
                        <h3>Invoice items</h3>
                        {invoice.items.map((item, index) => (
                          <div className="patient-invoice-item" key={item.id ?? `${invoice.id}-${index}`}>
                            <span>{item.description}</span>
                            <strong>{money(item.lineTotal ?? item.total ?? item.quantity * item.unitPrice)}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
