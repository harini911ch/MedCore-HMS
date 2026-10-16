import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../services/authService";
import { getHospitals } from "../services/hospitalService";
import { getPatientsByHospital, type Patient } from "../services/patientService";
import { getAppointmentsByHospital, type Appointment } from "../services/appointmentService";
import type { Hospital } from "../types/hospital";
import {
  createInvoice,
  finalizeInvoice,
  getHospitalInvoices,
  recordPayment,
  type Invoice,
  type InvoiceItemCategory,
} from "../services/billingService";
import "./Billing.css";

interface ItemForm {
  description: string;
  category: InvoiceItemCategory;
  quantity: number;
  unitPrice: number;
}

const emptyItem: ItemForm = {
  description: "",
  category: "CONSULTATION",
  quantity: 1,
  unitPrice: 0,
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function Billing() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalId, setHospitalId] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | "draft" | "outstanding" | "paid">("all");
  const [appointmentId, setAppointmentId] = useState("");
  const [items, setItems] = useState<ItemForm[]>([{ ...emptyItem }]);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyInvoiceId, setBusyInvoiceId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedAppointment = appointments.find((a) => a.id === appointmentId);
  const selectedPatient = patients.find((p) => p.id === selectedAppointment?.patientId);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice), 0),
    [items],
  );
  const draftCount = invoices.filter(
    (invoice) => invoice.status.toUpperCase() === "DRAFT"
  ).length;

  const outstandingInvoices = invoices.filter((invoice) => {
    const status = invoice.status.toUpperCase();
    return status !== "DRAFT" && status !== "PAID" && invoice.amountDue > 0;
  });

  const paidCount = invoices.filter(
    (invoice) => invoice.status.toUpperCase() === "PAID"
  ).length;

  const filteredInvoices = useMemo(() => {
    if (invoiceFilter === "draft") {
      return invoices.filter((invoice) => invoice.status.toUpperCase() === "DRAFT");
    }
    if (invoiceFilter === "outstanding") {
      return invoices.filter((invoice) => {
        const status = invoice.status.toUpperCase();
        return status !== "DRAFT" && status !== "PAID" && invoice.amountDue > 0;
      });
    }
    if (invoiceFilter === "paid") {
      return invoices.filter((invoice) => invoice.status.toUpperCase() === "PAID");
    }
    return invoices;
  }, [invoices, invoiceFilter]);
  const taxAmount = subtotal * Math.max(0, taxRate) / 100;
  const total = subtotal + taxAmount;

  useEffect(() => {
    let cancelled = false;

    async function loadHospitals() {
      setLoading(true);
      setError("");
      try {
        const result = await getHospitals();
        if (cancelled) return;
        setHospitals(result);
        if (result.length) setHospitalId(result[0].id);
        else setError("No hospitals were found. Register a hospital before creating an invoice.");
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadHospitals();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hospitalId) {
      setPatients([]);
      setAppointments([]);
      setInvoices([]);
      setAppointmentId("");
      return;
    }

    let cancelled = false;
    async function loadRecords() {
      setLoadingRecords(true);
      setError("");
      setSuccess("");
      setAppointmentId("");
      try {
        const [patientResult, appointmentResult, invoiceResult] = await Promise.all([
          getPatientsByHospital(hospitalId),
          getAppointmentsByHospital(hospitalId),
          getHospitalInvoices(hospitalId),
        ]);
        if (cancelled) return;
        setPatients(patientResult);
        setAppointments(appointmentResult);
        setInvoices(invoiceResult);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoadingRecords(false);
      }
    }

    void loadRecords();
    return () => { cancelled = true; };
  }, [hospitalId]);

  function updateItem(index: number, field: keyof ItemForm, value: string) {
    setItems((current) => current.map((item, i) => {
      if (i !== index) return item;
      if (field === "quantity" || field === "unitPrice") {
        return { ...item, [field]: Math.max(0, Number(value) || 0) };
      }
      return { ...item, [field]: value };
    }));
  }

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  async function refreshInvoices() {
    if (!hospitalId) return;
    const result = await getHospitalInvoices(hospitalId);
    setInvoices(result);
  }

  async function handleCreateInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!hospitalId) return setError("Select a hospital.");
    if (!selectedAppointment) return setError("Select an appointment.");
    if (!selectedPatient) return setError("The appointment's patient was not found in this hospital.");
    if (!items.length || items.some((item) => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
      return setError("Enter a description, a quantity greater than zero, and a valid unit price for every item.");
    }

    setSaving(true);
    try {
      const invoice = await createInvoice({
        hospitalId,
        patientId: selectedPatient.id,
        appointmentId: selectedAppointment.id,
        taxRate: Math.max(0, taxRate),
        items: items.map((item) => ({
          description: item.description.trim(),
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      await refreshInvoices();
      setSuccess(`Draft invoice ${invoice.invoiceNumber} created successfully. Finalize it below when ready.`);
      setItems([{ ...emptyItem }]);
      setTaxRate(0);
      setAppointmentId("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalize(invoice: Invoice) {
    setError("");
    setSuccess("");
    setBusyInvoiceId(invoice.id);
    try {
      const updated = await finalizeInvoice(invoice.id);
      await refreshInvoices();
      setSuccess(`Invoice ${updated.invoiceNumber} finalized successfully.`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyInvoiceId("");
    }
  }

  async function handlePayment(invoice: Invoice) {
    const amount = Number(paymentAmounts[invoice.id] ?? invoice.amountDue);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a payment amount greater than zero.");
      return;
    }
    if (amount > invoice.amountDue) {
      setError("Payment cannot exceed the invoice amount due.");
      return;
    }

    setError("");
    setSuccess("");
    setBusyInvoiceId(invoice.id);
    try {
      await recordPayment(invoice.id, { amount, method: "CASH" });
      await refreshInvoices();
      setPaymentAmounts((current) => ({ ...current, [invoice.id]: "" }));
      setSuccess(`Cash payment recorded for ${invoice.invoiceNumber}.`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyInvoiceId("");
    }
  }

  const usableAppointments = appointments.filter((appointment) =>
    patients.some((patient) => patient.id === appointment.patientId),
  );

  return (
    <main className="billing-page">
      <header className="billing-header">
        <button className="billing-brand" type="button" onClick={() => navigate("/app/admin/dashboard")}>
          <span className="billing-brand-mark">M</span>
          <span><strong>MedCore</strong><small>Hospital Management System</small></span>
        </button>
        <div className="billing-header-actions">
          <span className="billing-role">BILLING &amp; FINANCE</span>
          <button className="billing-logout" type="button" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <section className="billing-content">
        <div className="billing-page-intro">
          <div>
            <p className="billing-eyebrow">REVENUE MANAGEMENT</p>
            <h1>Billing &amp; Invoices</h1>
            <p className="billing-subtitle">Create invoices, review balances, and record cash payments.</p>
          </div>
          <button className="billing-secondary-button" type="button" onClick={() => navigate("/app/admin/dashboard")}>
            ← Dashboard
          </button>
        </div>

        {error && <div className="billing-alert billing-alert-error" role="alert">{error}</div>}
        {success && <div className="billing-alert billing-alert-success" role="status">{success}</div>}

        <section className="billing-panel">
          <div className="billing-panel-heading">
            <div><span className="billing-step">01</span><div><h2>Create an invoice</h2><p>Select a completed or appropriate appointment and add charges.</p></div></div>
          </div>

          {loading ? <p className="billing-state">Loading hospitals…</p> : (
            <form onSubmit={handleCreateInvoice}>
              <div className="billing-form-grid">
                <label className="billing-field">
                  <span>Hospital</span>
                  <select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} required>
                    <option value="">Select hospital</option>
                    {hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
                  </select>
                </label>
                <label className="billing-field">
                  <span>Appointment</span>
                  <select value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} required disabled={loadingRecords || !usableAppointments.length}>
                    <option value="">Select appointment</option>
                    {usableAppointments.map((appointment) => {
                      const patient = patients.find((p) => p.id === appointment.patientId);
                      return <option key={appointment.id} value={appointment.id}>
                        {patient?.fullName ?? appointment.patientName ?? "Patient"} · {appointment.appointmentDate} · {appointment.status}
                      </option>;
                    })}
                  </select>
                  {!loadingRecords && hospitalId && !usableAppointments.length && <small className="billing-help">No appointments with matching patient records were found for this hospital.</small>}
                </label>
                <div className="billing-patient-summary">
                  <span>Selected patient</span>
                  <strong>{selectedPatient?.fullName ?? "Choose an appointment"}</strong>
                  <small>{selectedPatient ? `Patient no. ${selectedPatient.patientNumber}` : "Patient details will appear here."}</small>
                </div>
                <label className="billing-field">
                  <span>Tax rate (%)</span>
                  <input type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(e) => setTaxRate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} />
                </label>
              </div>

              <div className="billing-items-heading"><h3>Invoice items</h3><button className="billing-link-button" type="button" onClick={() => setItems((current) => [...current, { ...emptyItem }])}>+ Add item</button></div>
              <div className="billing-item-list">
                {items.map((item, index) => (
                  <div className="billing-item-row" key={index}>
                    <label className="billing-field billing-item-description"><span>Description</span><input value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} placeholder="e.g. Consultation fee" required /></label>
                    <label className="billing-field"><span>Category</span><select value={item.category} onChange={(e) => updateItem(index, "category", e.target.value)}><option value="CONSULTATION">Consultation</option><option value="LAB">Laboratory</option><option value="PHARMACY">Pharmacy</option><option value="ROOM">Room</option><option value="OTHER">Other</option></select></label>
                    <label className="billing-field"><span>Qty</span><input type="number" min="1" step="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} required /></label>
                    <label className="billing-field"><span>Unit price (₹)</span><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", e.target.value)} required /></label>
                    <div className="billing-line-total"><span>Line total</span><strong>{money(item.quantity * item.unitPrice)}</strong></div>
                    <button className="billing-remove-button" type="button" aria-label={`Remove item ${index + 1}`} disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, i) => i !== index))}>×</button>
                  </div>
                ))}
              </div>

              <div className="billing-create-bottom">
                <div className="billing-totals">
                  <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                  <div><span>Tax ({taxRate}%)</span><strong>{money(taxAmount)}</strong></div>
                  <div className="billing-grand-total"><span>Estimated total</span><strong>{money(total)}</strong></div>
                </div>
                <button className="billing-primary-button" type="submit" disabled={saving || loadingRecords || !hospitalId || !usableAppointments.length}>
                  {saving ? "Creating invoice…" : "Create draft invoice"}
                </button>
              </div>
              <p className="billing-disclaimer">Creating a draft does not charge the patient. Review and finalize the invoice before recording a payment.</p>
            </form>
          )}
        </section>

                <section className="billing-summary-grid" aria-label="Invoice summary">
          <button type="button" className={`billing-summary-card billing-summary-blue ${invoiceFilter === "all" ? "is-selected" : ""}`} aria-pressed={invoiceFilter === "all"} onClick={() => setInvoiceFilter("all")}>
            <span className="billing-summary-icon">▤</span>
            <span className="billing-summary-label">All invoices</span>
            <strong>{invoices.length}</strong>
            <small>Every invoice in this hospital</small>
          </button>
          <button type="button" className={`billing-summary-card billing-summary-amber ${invoiceFilter === "draft" ? "is-selected" : ""}`} aria-pressed={invoiceFilter === "draft"} onClick={() => setInvoiceFilter("draft")}>
            <span className="billing-summary-icon">✎</span>
            <span className="billing-summary-label">Draft invoices</span>
            <strong>{draftCount}</strong>
            <small>Awaiting finalization</small>
          </button>
          <button type="button" className={`billing-summary-card billing-summary-violet ${invoiceFilter === "outstanding" ? "is-selected" : ""}`} aria-pressed={invoiceFilter === "outstanding"} onClick={() => setInvoiceFilter("outstanding")}>
            <span className="billing-summary-icon">◷</span>
            <span className="billing-summary-label">Outstanding</span>
            <strong>{outstandingInvoices.length}</strong>
            <small>Invoices with a remaining balance</small>
          </button>
          <button type="button" className={`billing-summary-card billing-summary-green ${invoiceFilter === "paid" ? "is-selected" : ""}`} aria-pressed={invoiceFilter === "paid"} onClick={() => setInvoiceFilter("paid")}>
            <span className="billing-summary-icon">✓</span>
            <span className="billing-summary-label">Paid invoices</span>
            <strong>{paidCount}</strong>
            <small>Settled in full</small>
          </button>
        </section>
<section className="billing-panel">
          <div className="billing-panel-heading">
            <div><span className="billing-step">02</span><div><h2>Invoice register</h2><p>Finalize drafts and record cash payments for finalized invoices.</p></div></div>
            <button className="billing-secondary-button" type="button" onClick={() => void refreshInvoices()} disabled={!hospitalId || loadingRecords}>Refresh</button>
          </div>

          {loadingRecords ? <p className="billing-state">Loading hospital records…</p> : filteredInvoices.length === 0 ? (
            <div className="billing-empty"><span>▤</span><strong>No invoices to display</strong><p>Invoices for the selected hospital will appear here.</p></div>
          ) : (
            <div className="billing-table-wrap">
              <table className="billing-table">
                <thead><tr><th>Invoice</th><th>Patient</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredInvoices.map((invoice) => {
                    const patient = patients.find((p) => p.id === invoice.patientId);
                    const status = invoice.status.toUpperCase();
                    const busy = busyInvoiceId === invoice.id;
                    return (
                      <tr key={invoice.id}>
                        <td><strong>{invoice.invoiceNumber}</strong><small>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString("en-IN") : "—"}</small></td>
                        <td>{patient?.fullName ?? "Patient record"}</td>
                        <td>{money(invoice.total)}</td>
                        <td>{money(invoice.amountPaid)}</td>
                        <td>{money(invoice.amountDue)}</td>
                        <td><span className={`billing-status billing-status-${status.toLowerCase()}`}>{status.replaceAll("_", " ")}</span></td>
                        <td className="billing-actions-cell">
                          {status === "DRAFT" && <button className="billing-small-button" type="button" disabled={busy} onClick={() => void handleFinalize(invoice)}>{busy ? "Please wait…" : "Finalize"}</button>}
                          {(status === "FINALIZED" || status === "PARTIALLY_PAID") && invoice.amountDue > 0 && <>
                            <input className="billing-payment-input" aria-label={`Payment amount for ${invoice.invoiceNumber}`} type="number" min="0.01" max={invoice.amountDue} step="0.01" placeholder={String(invoice.amountDue)} value={paymentAmounts[invoice.id] ?? ""} onChange={(e) => setPaymentAmounts((current) => ({ ...current, [invoice.id]: e.target.value }))} />
                            <button className="billing-small-button" type="button" disabled={busy} onClick={() => void handlePayment(invoice)}>{busy ? "Please wait…" : "Pay cash"}</button>
                          </>}
                          {status === "PAID" && <span className="billing-paid-label">Paid in full</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
