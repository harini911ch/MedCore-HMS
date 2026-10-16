import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import "./Laboratory.css";
import {
  laboratoryService,
  type Hospital,
  type LabOrder,
  type LabResult,
  type LabTest,
} from "../services/laboratoryService";

type Tab = "orders" | "tests" | "results";
type OrderCardFilter = "ALL" | "PENDING" | "COMPLETED";
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString() : "—";
const money = (value?: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value ?? 0);
const shortId = (value?: string) => value ? `${value.slice(0, 8)}…` : "—";

export default function Laboratory() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalId, setHospitalId] = useState("");
  const [tests, setTests] = useState<LabTest[]>([]);
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [results, setResults] = useState<LabResult[]>([]);
  const [tab, setTab] = useState<Tab>("orders");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cardFilter, setCardFilter] = useState<OrderCardFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showTestForm, setShowTestForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [resultOrderId, setResultOrderId] = useState("");
  const [resultRows, setResultRows] = useState<LabResult[]>([]);

  const [testForm, setTestForm] = useState({ name: "", description: "", sampleType: "Blood", price: "0" });
  const [orderForm, setOrderForm] = useState({ patientId: "", doctorId: "", medicalRecordId: "", clinicalNotes: "", testIds: [] as string[] });
  const [resultForm, setResultForm] = useState({ labTestId: "", resultValue: "", unit: "", referenceRange: "", remarks: "" });

  const loadData = useCallback(async (id: string) => {
    if (!id) { setTests([]); setOrders([]); setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const [testData, orderData] = await Promise.all([
        laboratoryService.getTests(id),
        laboratoryService.getOrders(id),
      ]);
      setTests(testData);
      setOrders(orderData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load laboratory data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    laboratoryService.getHospitals().then((data) => {
      if (!active) return;
      setHospitals(data);
      if (data.length) setHospitalId((current) => current || data[0].id);
      else { setError("No hospitals were returned by the API."); setLoading(false); }
    }).catch((e) => {
      if (active) { setError(e instanceof Error ? e.message : "Unable to load hospitals."); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => { if (hospitalId) void loadData(hospitalId); }, [hospitalId, loadData]);

  const visibleOrders = useMemo(() => orders.filter((order) => {
    const haystack = `${order.id} ${order.patientId} ${order.doctorId} ${order.status} ${order.clinicalNotes ?? ""}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    const matchesCard =
      cardFilter === "ALL" ||
      (cardFilter === "PENDING" && !["COMPLETED", "CANCELLED"].includes(order.status)) ||
      (cardFilter === "COMPLETED" && order.status === "COMPLETED");

    return matchesSearch && matchesStatus && matchesCard;
  }), [orders, query, statusFilter, cardFilter]);

  const completedCount = orders.filter((order) => order.status === "COMPLETED").length;
  const pendingCount = orders.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status)).length;
  const activeTests = tests.filter((test) => test.active).length;

  async function submitTest(event: FormEvent) {
    event.preventDefault();
    if (!hospitalId) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await laboratoryService.createTest({
        hospitalId, name: testForm.name.trim(), description: testForm.description.trim(),
        sampleType: testForm.sampleType.trim(), price: Number(testForm.price), active: true,
      });
      setNotice("Lab test added successfully.");
      setTestForm({ name: "", description: "", sampleType: "Blood", price: "0" });
      setShowTestForm(false);
      await loadData(hospitalId);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create lab test."); }
    finally { setBusy(false); }
  }

  async function submitOrder(event: FormEvent) {
    event.preventDefault();
    if (!hospitalId || !orderForm.testIds.length) { setError("Choose at least one lab test."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      await laboratoryService.createOrder({
        hospitalId, patientId: orderForm.patientId.trim(), doctorId: orderForm.doctorId.trim(),
        ...(orderForm.medicalRecordId.trim() ? { medicalRecordId: orderForm.medicalRecordId.trim() } : {}),
        clinicalNotes: orderForm.clinicalNotes.trim(),
        tests: orderForm.testIds.map((labTestId) => ({ labTestId })),
      });
      setNotice("Lab order created successfully.");
      setOrderForm({ patientId: "", doctorId: "", medicalRecordId: "", clinicalNotes: "", testIds: [] });
      setShowOrderForm(false);
      await loadData(hospitalId);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create lab order."); }
    finally { setBusy(false); }
  }

  async function changeStatus(order: LabOrder, status: string) {
    setBusy(true); setError(""); setNotice("");
    try {
      await laboratoryService.updateOrderStatus(order.id, status);
      setNotice(`Order status updated to ${status}.`);
      await loadData(hospitalId);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update status."); }
    finally { setBusy(false); }
  }

  async function openResults(order: LabOrder) {
    setSelectedOrder(order); setResultOrderId(order.id); setError(""); setNotice("");
    try {
      const data = await laboratoryService.getOrderResults(order.id);
      setResultRows(data); setResults((current) => [...current.filter((r) => r.labOrderId !== order.id), ...data]);
      setTab("results");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load results."); }
  }

  async function submitResult(event: FormEvent) {
    event.preventDefault();
    if (!resultOrderId || !resultForm.labTestId) { setError("Enter an order ID and select a test."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await laboratoryService.createResult({
        labOrderId: resultOrderId.trim(), labTestId: resultForm.labTestId,
        resultValue: resultForm.resultValue.trim(), unit: resultForm.unit.trim(),
        referenceRange: resultForm.referenceRange.trim(), remarks: resultForm.remarks.trim(),
      });
      setResults((current) => [...current, saved]);
      setResultRows((current) => [...current, saved]);
      setNotice("Lab result saved successfully.");
      setResultForm({ labTestId: "", resultValue: "", unit: "", referenceRange: "", remarks: "" });
      setShowResultForm(false);
      await loadData(hospitalId);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save result."); }
    finally { setBusy(false); }
  }

  async function loadResultsForOrder() {
    if (!resultOrderId.trim()) { setError("Enter a lab order ID."); return; }
    setError("");
    try {
      const data = await laboratoryService.getOrderResults(resultOrderId.trim());
      setResultRows(data);
      setResults((current) => [...current.filter((r) => r.labOrderId !== resultOrderId.trim()), ...data]);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load results."); }
  }

  return (
    <main className="lab-page">
      <div className="lab-glow lab-glow-one" aria-hidden="true" />
      <div className="lab-glow lab-glow-two" aria-hidden="true" />
      <div className="lab-container">
        <header className="lab-header">
          <div>
            <div className="lab-eyebrow"><span className="lab-live-dot" /> MEDCORE HMS / CLINICAL OPERATIONS</div>
            <h1>Laboratory <span>workspace</span></h1>
            <p>Manage diagnostic tests, track orders, and record clinical results.</p>
          </div>
          <div className="lab-header-actions">
            <label className="lab-hospital-select">
              <span>Hospital</span>
              <select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} disabled={!hospitals.length}>
                {hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
              </select>
            </label>
            <button className="lab-button lab-button-primary" onClick={() => { setError(""); setNotice(""); setShowOrderForm(true); }}><span>＋</span> New lab order</button>
          </div>
        </header>

        {error && <div className="lab-alert lab-alert-error" role="alert"><span>!</span><div><strong>Something needs attention</strong><p>{error}</p></div><button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
        {notice && <div className="lab-alert lab-alert-success" role="status"><span>✓</span><p>{notice}</p><button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}

        <section className="lab-stat-grid" aria-label="Laboratory overview">
          <button type="button" className={`lab-stat-card lab-stat-blue lab-stat-interactive ${tab === "orders" && cardFilter === "ALL" ? "lab-stat-selected" : ""}`} aria-pressed={tab === "orders" && cardFilter === "ALL"} onClick={() => { setTab("orders"); setCardFilter("ALL"); setStatusFilter("ALL"); document.getElementById("lab-main-card")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
            <div className="lab-stat-top"><span>LAB ORDERS</span><span className="lab-stat-icon">↗</span></div><strong>{orders.length}</strong><p>Total orders in this hospital</p><div className="lab-stat-bottom"><span className="lab-stat-line" /></div><span className="lab-stat-hint">View all orders →</span>
          </button>
          <button type="button" className={`lab-stat-card lab-stat-teal lab-stat-interactive ${tab === "orders" && cardFilter === "PENDING" ? "lab-stat-selected" : ""}`} aria-pressed={tab === "orders" && cardFilter === "PENDING"} onClick={() => { setTab("orders"); setCardFilter("PENDING"); setStatusFilter("ALL"); document.getElementById("lab-main-card")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
            <div className="lab-stat-top"><span>AWAITING COMPLETION</span><span className="lab-stat-icon">◷</span></div><strong>{pendingCount}</strong><p>Orders in progress or awaiting results</p><div className="lab-stat-bottom"><span className="lab-stat-line" /></div><span className="lab-stat-hint">View pending orders →</span>
          </button>
          <button type="button" className={`lab-stat-card lab-stat-violet lab-stat-interactive ${tab === "orders" && cardFilter === "COMPLETED" ? "lab-stat-selected" : ""}`} aria-pressed={tab === "orders" && cardFilter === "COMPLETED"} onClick={() => { setTab("orders"); setCardFilter("COMPLETED"); setStatusFilter("ALL"); document.getElementById("lab-main-card")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
            <div className="lab-stat-top"><span>COMPLETED</span><span className="lab-stat-icon">✓</span></div><strong>{completedCount}</strong><p>Orders marked completed</p><div className="lab-stat-bottom"><span className="lab-stat-line" /></div><span className="lab-stat-hint">View completed orders →</span>
          </button>
          <button type="button" className={`lab-stat-card lab-stat-amber lab-stat-interactive ${tab === "tests" ? "lab-stat-selected" : ""}`} aria-pressed={tab === "tests"} onClick={() => { setTab("tests"); setCardFilter("ALL"); setStatusFilter("ALL"); document.getElementById("lab-main-card")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
            <div className="lab-stat-top"><span>AVAILABLE TESTS</span><span className="lab-stat-icon">⌕</span></div><strong>{activeTests}</strong><p>Tests available for ordering</p><div className="lab-stat-bottom"><span className="lab-stat-line" /></div><span className="lab-stat-hint">Open test catalogue →</span>
          </button>
        </section>

        <section className="lab-main-card" id="lab-main-card">
          <div className="lab-section-heading">
            <div><span className="lab-section-kicker">DIAGNOSTICS</span><h2>Laboratory management</h2><p>Search, review and update laboratory activity.</p></div>
            <button className="lab-button lab-button-soft" onClick={() => void loadData(hospitalId)} disabled={loading}>↻ Refresh</button>
          </div>
          <div className="lab-tabs" role="tablist" aria-label="Laboratory sections">
            <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")} role="tab" aria-selected={tab === "orders"}>Order queue <span>{orders.length}</span></button>
            <button className={tab === "tests" ? "active" : ""} onClick={() => setTab("tests")} role="tab" aria-selected={tab === "tests"}>Test catalogue <span>{tests.length}</span></button>
            <button className={tab === "results" ? "active" : ""} onClick={() => setTab("results")} role="tab" aria-selected={tab === "results"}>Results <span>{results.length}</span></button>
          </div>

          {tab !== "results" && <div className="lab-toolbar"><label className="lab-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tab === "orders" ? "Search by order, patient or doctor ID..." : "Search tests by name or sample type..."} /></label>
            {tab === "orders" && <select className="lab-filter" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCardFilter("ALL"); }}><option value="ALL">All statuses</option><option value="ORDERED">Ordered</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select>}
            <button className="lab-button lab-button-primary" onClick={() => tab === "tests" ? setShowTestForm(true) : setShowOrderForm(true)}>{tab === "tests" ? "＋ Add test" : "＋ New order"}</button>
          </div>}

          {loading ? <div className="lab-loading"><span className="lab-spinner" /><strong>Loading laboratory workspace…</strong><p>Connecting to MedCore services</p></div> :
          tab === "orders" ? <div className="lab-table-wrap"><table className="lab-table"><thead><tr><th>ORDER</th><th>PATIENT</th><th>DOCTOR</th><th>ORDERED</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>
            {visibleOrders.filter((o) => `${o.id} ${o.patientId} ${o.doctorId} ${o.status} ${o.clinicalNotes ?? ""}`.toLowerCase().includes(query.toLowerCase())).map((order) => <tr key={order.id}><td><strong className="lab-mono">{shortId(order.id)}</strong><small>{order.clinicalNotes || "Diagnostic order"}</small></td><td><span className="lab-id-pill">{shortId(order.patientId)}</span></td><td><span className="lab-id-pill">{shortId(order.doctorId)}</span></td><td>{formatDate(order.orderedAt)}</td><td><span className={`lab-status status-${order.status.toLowerCase()}`}>{order.status.replaceAll("_", " ")}</span></td><td><div className="lab-row-actions"><button className="lab-action-button" onClick={() => void openResults(order)}>View results</button><select aria-label={`Update status for ${shortId(order.id)}`} value={order.status} disabled={busy || order.status === "CANCELLED"} onChange={(e) => void changeStatus(order, e.target.value)}><option value="ORDERED">Ordered</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></div></td></tr>)}
            {!visibleOrders.length && <tr><td colSpan={6}><div className="lab-empty"><span>⌕</span><strong>No lab orders found</strong><p>Create a new order or adjust your search and filters.</p><button className="lab-button lab-button-soft" onClick={() => setShowOrderForm(true)}>Create first order</button></div></td></tr>}
          </tbody></table></div> :
          tab === "tests" ? <div className="lab-table-wrap"><table className="lab-table"><thead><tr><th>TEST</th><th>SAMPLE TYPE</th><th>DESCRIPTION</th><th>PRICE</th><th>STATUS</th></tr></thead><tbody>
            {tests.filter((t) => `${t.name} ${t.sampleType} ${t.description ?? ""}`.toLowerCase().includes(query.toLowerCase())).map((test) => <tr key={test.id}><td><strong>{test.name}</strong><small className="lab-mono">{shortId(test.id)}</small></td><td><span className="lab-sample-pill">{test.sampleType}</span></td><td>{test.description || "—"}</td><td><strong>{money(test.price)}</strong></td><td><span className={`lab-status ${test.active ? "status-completed" : "status-cancelled"}`}>{test.active ? "ACTIVE" : "INACTIVE"}</span></td></tr>)}
            {!tests.length && <tr><td colSpan={5}><div className="lab-empty"><span>＋</span><strong>Your test catalogue is empty</strong><p>Add the first diagnostic test to make it available for orders.</p><button className="lab-button lab-button-primary" onClick={() => setShowTestForm(true)}>Add a lab test</button></div></td></tr>}
          </tbody></table></div> :
          <div className="lab-results-panel">
            <div className="lab-result-lookup"><div><strong>Look up results</strong><p>Load results for an existing lab order.</p></div><input value={resultOrderId} onChange={(e) => setResultOrderId(e.target.value)} placeholder="Paste lab order UUID" /><button className="lab-button lab-button-primary" onClick={() => void loadResultsForOrder()}>Load results</button><button className="lab-button lab-button-soft" onClick={() => setShowResultForm(true)}>＋ Enter result</button></div>
            {selectedOrder && <p className="lab-context-note">Selected order <strong className="lab-mono">{selectedOrder.id}</strong> · Patient <strong className="lab-mono">{selectedOrder.patientId}</strong></p>}
            <div className="lab-table-wrap"><table className="lab-table"><thead><tr><th>RESULT</th><th>TEST ID</th><th>VALUE</th><th>REFERENCE RANGE</th><th>RECORDED</th></tr></thead><tbody>
              {resultRows.map((result) => <tr key={result.id}><td><strong className="lab-mono">{shortId(result.id)}</strong><small>{result.remarks || "Lab result"}</small></td><td className="lab-mono">{shortId(result.labTestId)}</td><td><strong>{result.resultValue} {result.unit || ""}</strong></td><td>{result.referenceRange || "—"}</td><td>{formatDate(result.resultedAt || result.createdAt)}</td></tr>)}
              {!resultRows.length && <tr><td colSpan={5}><div className="lab-empty"><span>◉</span><strong>No results loaded</strong><p>Select “View results” on an order or look up an order ID.</p></div></td></tr>}
            </tbody></table></div>
          </div>}
          <footer className="lab-card-footer"><span><i /> Secure connection to MedCore API</span><span>{loading ? "Refreshing data…" : `Showing ${tab === "orders" ? visibleOrders.length : tab === "tests" ? tests.length : resultRows.length} ${tab}`}</span></footer>
        </section>
        <p className="lab-page-footnote">MedCore HMS <span>•</span> Laboratory operations <span>•</span> Use verified patient and clinician IDs when creating orders.</p>
      </div>

      {(showTestForm || showOrderForm || showResultForm) && <div className="lab-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) { setShowTestForm(false); setShowOrderForm(false); setShowResultForm(false); } }}>
        <section className="lab-modal" role="dialog" aria-modal="true" aria-labelledby="lab-modal-title">
          <div className="lab-modal-head"><div><span className="lab-section-kicker">MEDCORE LABORATORY</span><h2 id="lab-modal-title">{showTestForm ? "Add diagnostic test" : showOrderForm ? "Create lab order" : "Record lab result"}</h2><p>{showTestForm ? "Add a test to this hospital's active catalogue." : showOrderForm ? "Link a patient, clinician and one or more tests." : "Save the result against an existing order and test."}</p></div><button onClick={() => { setShowTestForm(false); setShowOrderForm(false); setShowResultForm(false); }} aria-label="Close dialog">×</button></div>
          {showTestForm && <form onSubmit={submitTest} className="lab-form"><label>Test name *<input required maxLength={120} value={testForm.name} onChange={(e) => setTestForm({...testForm, name: e.target.value})} placeholder="e.g. Complete Blood Count" /></label><label>Sample type *<select required value={testForm.sampleType} onChange={(e) => setTestForm({...testForm, sampleType: e.target.value})}><option>Blood</option><option>Urine</option><option>Serum</option><option>Plasma</option><option>Swab</option><option>Stool</option><option>Other</option></select></label><label>Price (₹) *<input required type="number" min="0" step="0.01" value={testForm.price} onChange={(e) => setTestForm({...testForm, price: e.target.value})} /></label><label>Description<textarea rows={3} value={testForm.description} onChange={(e) => setTestForm({...testForm, description: e.target.value})} placeholder="Purpose or notes about this test" /></label><div className="lab-form-actions"><button type="button" className="lab-button lab-button-soft" onClick={() => setShowTestForm(false)}>Cancel</button><button disabled={busy} className="lab-button lab-button-primary">{busy ? "Saving…" : "Add test"}</button></div></form>}
          {showOrderForm && <form onSubmit={submitOrder} className="lab-form"><div className="lab-form-note">Use the UUIDs from your existing patient and doctor records. The backend validates that the selected tests belong to this hospital.</div><label>Patient UUID *<input required value={orderForm.patientId} onChange={(e) => setOrderForm({...orderForm, patientId: e.target.value})} placeholder="Paste patient ID" /></label><label>Doctor UUID *<input required value={orderForm.doctorId} onChange={(e) => setOrderForm({...orderForm, doctorId: e.target.value})} placeholder="Paste doctor ID" /></label><label>Medical record UUID (optional)<input value={orderForm.medicalRecordId} onChange={(e) => setOrderForm({...orderForm, medicalRecordId: e.target.value})} placeholder="Paste medical record ID" /></label><fieldset className="lab-test-picker"><legend>Tests to order *</legend>{tests.filter((t) => t.active).map((test) => <label key={test.id} className="lab-check-row"><input type="checkbox" checked={orderForm.testIds.includes(test.id)} onChange={(e) => setOrderForm({...orderForm, testIds: e.target.checked ? [...orderForm.testIds, test.id] : orderForm.testIds.filter((id) => id !== test.id)})} /><span><strong>{test.name}</strong><small>{test.sampleType} · {money(test.price)}</small></span></label>)}{!activeTests && <p>Add an active test to the catalogue before creating an order.</p>}</fieldset><label>Clinical notes<textarea rows={3} value={orderForm.clinicalNotes} onChange={(e) => setOrderForm({...orderForm, clinicalNotes: e.target.value})} placeholder="Optional clinical context" /></label><div className="lab-form-actions"><button type="button" className="lab-button lab-button-soft" onClick={() => setShowOrderForm(false)}>Cancel</button><button disabled={busy || !orderForm.testIds.length} className="lab-button lab-button-primary">{busy ? "Creating…" : "Create order"}</button></div></form>}
          {showResultForm && <form onSubmit={submitResult} className="lab-form"><label>Lab order UUID *<input required value={resultOrderId} onChange={(e) => setResultOrderId(e.target.value)} placeholder="Paste order ID" /></label><label>Lab test *<select required value={resultForm.labTestId} onChange={(e) => setResultForm({...resultForm, labTestId: e.target.value})}><option value="">Select test</option>{tests.map((test) => <option key={test.id} value={test.id}>{test.name}</option>)}</select></label><label>Result value *<input required value={resultForm.resultValue} onChange={(e) => setResultForm({...resultForm, resultValue: e.target.value})} placeholder="Enter verified result" /></label><div className="lab-form-two"><label>Unit<input value={resultForm.unit} onChange={(e) => setResultForm({...resultForm, unit: e.target.value})} placeholder="e.g. g/dL" /></label><label>Reference range<input value={resultForm.referenceRange} onChange={(e) => setResultForm({...resultForm, referenceRange: e.target.value})} placeholder="e.g. 12–16" /></label></div><label>Remarks<textarea rows={2} value={resultForm.remarks} onChange={(e) => setResultForm({...resultForm, remarks: e.target.value})} placeholder="Optional laboratory remarks" /></label><div className="lab-form-note">Only submit verified laboratory values. Saving a result marks the backend order completed according to the current service implementation.</div><div className="lab-form-actions"><button type="button" className="lab-button lab-button-soft" onClick={() => setShowResultForm(false)}>Cancel</button><button disabled={busy} className="lab-button lab-button-primary">{busy ? "Saving…" : "Save result"}</button></div></form>}
        </section>
      </div>}
    </main>
  );
}
