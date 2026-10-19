import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import "./Pharmacy.css";
import {
  pharmacyService,
  type Medicine,
  type PharmacyBatch,
  type PharmacyDispense,
  type HospitalOption,
  type HospitalListResponse,
} from "../services/pharmacyService";


const emptyMedicine = {
  name: "", genericName: "", dosageForm: "", strength: "", manufacturer: "",
};
const emptyBatch = {
  medicineId: "", batchNumber: "", expiryDate: "", quantityAvailable: "100",
  reorderLevel: "10", purchasePrice: "0", sellingPrice: "0",
};

function money(value?: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value ?? 0);
}
function date(value?: string) {
  if (!value) return "â€”";
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-IN");
}
function time(value?: string) {
  if (!value) return "â€”";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("en-IN");
}
function getId(hospital: HospitalOption): string {
  return String(hospital?.id ?? hospital?.hospitalId ?? "");
}
function getName(hospital: HospitalOption): string {
  return String(hospital?.name ?? hospital?.hospitalName ?? hospital?.displayName ?? "Hospital");
}

export default function Pharmacy() {
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [hospitalId, setHospitalId] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<PharmacyBatch[]>([]);
  const [history, setHistory] = useState<PharmacyDispense[]>([]);
  const [activeTab, setActiveTab] = useState<"inventory" | "medicines" | "history">("inventory");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "expired">("all");
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [medicineForm, setMedicineForm] = useState(emptyMedicine);
  const [batchForm, setBatchForm] = useState(emptyBatch);
  const [dispenseBatch, setDispenseBatch] = useState<PharmacyBatch | null>(null);
  const [dispenseQuantity, setDispenseQuantity] = useState("1");
  const [prescriptionItemId, setPrescriptionItemId] = useState("");
  const [linkPrescription, setLinkPrescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async (selectedHospitalId: string) => {
    if (!selectedHospitalId) return;
    setLoading(true);
    setError("");
    try {
      const [medicineData, batchData, historyData] = await Promise.all([
        pharmacyService.getMedicines(selectedHospitalId),
        pharmacyService.getBatches(selectedHospitalId),
        pharmacyService.getHistory(selectedHospitalId),
      ]);
      setMedicines(medicineData);
      setBatches(batchData);
      setHistory(historyData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load pharmacy data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    pharmacyService.getHospitals()
      .then((result) => {
        if (!alive) return;
        const list: HospitalOption[] = Array.isArray(result)
          ? result
          : (() => {
              const wrapped = result as Exclude<HospitalListResponse, HospitalOption[]>;
              return wrapped.content ?? wrapped.data ?? [];
            })();
        const options = list.map((item: HospitalOption) => ({ id: getId(item), name: getName(item) })).filter((item: HospitalOption) => item.id);
        setHospitals(options);
        if (options.length) setHospitalId((current) => current || options[0].id);
        else setError("No hospital was returned by the API. Check your access and hospital setup.");
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Unable to load hospitals.");
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (hospitalId) void loadData(hospitalId);
  }, [hospitalId, loadData]);

  const visibleBatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return batches.filter((batch) => {
      const matchesSearch = !term ||
        `${batch.medicineName} ${batch.medicineStrength ?? ""} ${batch.batchNumber}`
          .toLowerCase().includes(term);

      const matchesStockFilter =
        stockFilter === "all" ||
        (stockFilter === "low" && batch.lowStock && !batch.expired) ||
        (stockFilter === "expired" && batch.expired);

      return matchesSearch && matchesStockFilter;
    });
  }, [batches, search, stockFilter]);
  const lowStockCount = batches.filter((batch) => batch.lowStock && !batch.expired).length;
  const expiredCount = batches.filter((batch) => batch.expired).length;
  const totalUnits = batches.reduce((sum, batch) => sum + (batch.quantityAvailable || 0), 0);
  const inventoryValue = batches.reduce((sum, batch) => sum + (batch.quantityAvailable || 0) * (batch.purchasePrice || 0), 0);

  function clearMessages() { setError(""); setNotice(""); }

  async function submitMedicine(event: FormEvent) {
    event.preventDefault();
    if (!hospitalId) return;
    setSaving(true); clearMessages();
    try {
      await pharmacyService.createMedicine({ hospitalId, ...medicineForm });
      setMedicineForm(emptyMedicine);
      setShowMedicineForm(false);
      setNotice("Medicine added successfully.");
      await loadData(hospitalId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to add medicine.");
    } finally { setSaving(false); }
  }

  async function submitBatch(event: FormEvent) {
    event.preventDefault();
    if (!hospitalId) return;
    setSaving(true); clearMessages();
    try {
      await pharmacyService.createBatch({
        hospitalId,
        medicineId: batchForm.medicineId,
        batchNumber: batchForm.batchNumber.trim(),
        expiryDate: batchForm.expiryDate,
        quantityAvailable: Number(batchForm.quantityAvailable),
        reorderLevel: Number(batchForm.reorderLevel),
        purchasePrice: Number(batchForm.purchasePrice),
        sellingPrice: Number(batchForm.sellingPrice),
      });
      setBatchForm(emptyBatch);
      setShowBatchForm(false);
      setNotice("Stock batch added successfully.");
      await loadData(hospitalId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to add stock batch.");
    } finally { setSaving(false); }
  }

  async function submitDispense(event: FormEvent) {
    event.preventDefault();
    if (!dispenseBatch || !hospitalId) return;
    const quantity = Number(dispenseQuantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Enter a whole-number quantity greater than zero."); return;
    }
    if (quantity > dispenseBatch.quantityAvailable) {
      setError(`Only ${dispenseBatch.quantityAvailable} units are currently available.`); return;
    }
    if (linkPrescription && !prescriptionItemId.trim()) {
      setError("Enter the prescription item ID to use prescription-linked dispensing."); return;
    }
    setSaving(true); clearMessages();
    try {
      if (linkPrescription) {
        await pharmacyService.dispensePrescription(dispenseBatch.id, prescriptionItemId.trim(), quantity);
      } else {
        await pharmacyService.dispense(dispenseBatch.id, quantity);
      }
      setDispenseBatch(null);
      setDispenseQuantity("1");
      setPrescriptionItemId("");
      setLinkPrescription(false);
      setNotice("Dispensing recorded and stock updated.");
      await loadData(hospitalId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to dispense medicine.");
    } finally { setSaving(false); }
  }

  return (
    <main className="pharmacy-page">
      <div className="pharmacy-header">
        <div>
          <span className="pharmacy-eyebrow">HOSPITAL OPERATIONS</span>
          <h1>Pharmacy & Inventory</h1>
          <p>Manage medicines, monitor stock, and record dispensing.</p>
        </div>
        <div className="pharmacy-header-actions">
          <label className="hospital-picker">
            <span>Hospital</span>
            <select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} disabled={!hospitals.length}>
              {hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
            </select>
          </label>
          <button className="pharmacy-btn pharmacy-btn-primary" onClick={() => { clearMessages(); setShowBatchForm(true); }} disabled={!hospitalId}>
            + Add stock
          </button>
        </div>
      </div>

      {error && <div className="pharmacy-alert pharmacy-alert-error" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error">Ã—</button></div>}
      {notice && <div className="pharmacy-alert pharmacy-alert-success" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message">Ã—</button></div>}

      <section className="pharmacy-stats" aria-label="Pharmacy summary">
        <button type="button" className="pharmacy-stat pharmacy-stat-clickable"
          onClick={() => {
            setActiveTab("medicines");
            setStockFilter("all");
            setSearch("");
            document.getElementById("pharmacy-main-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}>
          <span className="stat-icon stat-blue">â–¦</span>
          <div><p>Medicine types</p><strong>{medicines.length}</strong><small>View medicine catalogue â†’</small></div>
        </button>
        <button type="button" className="pharmacy-stat pharmacy-stat-clickable"
          onClick={() => {
            setActiveTab("inventory");
            setStockFilter("all");
            setSearch("");
            document.getElementById("pharmacy-main-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}>
          <span className="stat-icon stat-purple">â–¤</span>
          <div><p>Units in stock</p><strong>{totalUnits.toLocaleString("en-IN")}</strong><small>View all inventory â†’</small></div>
        </button>
        <button type="button" className="pharmacy-stat pharmacy-stat-clickable"
          onClick={() => {
            setActiveTab("inventory");
            setStockFilter("low");
            setSearch("");
            document.getElementById("pharmacy-main-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}>
          <span className="stat-icon stat-amber">!</span>
          <div><p>Low-stock batches</p><strong>{lowStockCount}</strong><small>Review low stock â†’</small></div>
        </button>
        <button type="button" className="pharmacy-stat pharmacy-stat-clickable"
          onClick={() => {
            setActiveTab("inventory");
            setStockFilter("expired");
            setSearch("");
            document.getElementById("pharmacy-main-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}>
          <span className="stat-icon stat-red">â—·</span>
          <div><p>Expired batches</p><strong>{expiredCount}</strong><small>Review expired stock â†’</small></div>
        </button>
      </section>

      <section className="pharmacy-panel" id="pharmacy-main-panel">
        <div className="pharmacy-panel-top">
          {activeTab === "inventory" && stockFilter !== "all" && (
            <div className="pharmacy-filter-notice">
              <span>Showing {stockFilter === "low" ? "low-stock batches" : "expired batches"}</span>
              <button type="button" onClick={() => setStockFilter("all")}>Show all stock Ã—</button>
            </div>
          )}
          <div className="pharmacy-tabs" role="tablist" aria-label="Pharmacy sections">
            <button className={activeTab === "inventory" ? "active" : ""} onClick={() => setActiveTab("inventory")}>Inventory <span>{batches.length}</span></button>
            <button className={activeTab === "medicines" ? "active" : ""} onClick={() => setActiveTab("medicines")}>Medicine catalogue <span>{medicines.length}</span></button>
            <button className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>Dispensing history <span>{history.length}</span></button>
          </div>
          {activeTab === "inventory" && <label className="pharmacy-search"><span>âŒ•</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicine or batch..." /></label>}
          {activeTab === "medicines" && <button className="pharmacy-btn pharmacy-btn-primary" onClick={() => { clearMessages(); setShowMedicineForm(true); }}>+ Add medicine</button>}
        </div>

        {loading ? <div className="pharmacy-loading"><span className="pharmacy-spinner" /> Loading pharmacy dataâ€¦</div> : (
          <>
            {activeTab === "inventory" && <div className="pharmacy-table-wrap">
              <table className="pharmacy-table">
                <thead><tr><th>Medicine / batch</th><th>Expiry date</th><th>Available</th><th>Unit price</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {visibleBatches.map((batch) => <tr key={batch.id}>
                    <td><strong>{batch.medicineName}</strong><small>{batch.medicineStrength || "Strength not specified"} Â· Batch {batch.batchNumber}</small></td>
                    <td>{date(batch.expiryDate)}</td>
                    <td><strong>{batch.quantityAvailable}</strong><small>Reorder at {batch.reorderLevel}</small></td>
                    <td>{money(batch.sellingPrice)}</td>
                    <td>{batch.expired ? <span className="pharmacy-status status-danger">Expired</span> : batch.lowStock ? <span className="pharmacy-status status-warning">Low stock</span> : <span className="pharmacy-status status-good">In stock</span>}</td>
                    <td><button className="pharmacy-btn pharmacy-btn-small" disabled={batch.expired || batch.quantityAvailable < 1} onClick={() => { clearMessages(); setDispenseBatch(batch); }}>Dispense</button></td>
                  </tr>)}
                  {!visibleBatches.length && <tr><td colSpan={6} className="pharmacy-empty">{search ? "No inventory matches your search." : "No stock batches yet. Add a medicine and then add its stock batch."}</td></tr>}
                </tbody>
              </table>
            </div>}

            {activeTab === "medicines" && <div className="pharmacy-table-wrap">
              <table className="pharmacy-table">
                <thead><tr><th>Medicine</th><th>Generic name</th><th>Form / strength</th><th>Manufacturer</th><th>Stock batches</th></tr></thead>
                <tbody>{medicines.map((medicine) => <tr key={medicine.id}>
                  <td><strong>{medicine.name}</strong><small>{medicine.active ? "Active" : "Inactive"}</small></td>
                  <td>{medicine.genericName || "â€”"}</td><td>{medicine.dosageForm || "â€”"} {medicine.strength || ""}</td><td>{medicine.manufacturer || "â€”"}</td>
                  <td>{batches.filter((batch) => batch.medicineId === medicine.id).length}</td>
                </tr>)}{!medicines.length && <tr><td colSpan={5} className="pharmacy-empty">No medicines registered for this hospital yet.</td></tr>}</tbody>
              </table>
            </div>}

            {activeTab === "history" && <div className="pharmacy-table-wrap">
              <table className="pharmacy-table">
                <thead><tr><th>Medicine</th><th>Patient</th><th>Batch</th><th>Quantity</th><th>Remaining stock</th><th>Dispensed at</th></tr></thead>
                <tbody>{history.map((item) => <tr key={item.id}>
                  <td><strong>{item.medicineName}</strong>{item.prescriptionId && <small>Prescription-linked</small>}</td><td>{item.patientName || "General dispensing"}</td><td>{item.batchNumber}</td><td>{item.quantityDispensed}</td><td>{item.remainingQuantity}</td><td>{time(item.dispensedAt)}</td>
                </tr>)}{!history.length && <tr><td colSpan={6} className="pharmacy-empty">No dispensing activity recorded yet.</td></tr>}</tbody>
              </table>
            </div>}
          </>
        )}
      </section>
      <div className="pharmacy-inventory-foot"><span>Inventory valuation (purchase cost)</span><strong>{money(inventoryValue)}</strong><span>Â·</span><span>Values reflect the current stock response from the backend.</span></div>

      {showMedicineForm && <div className="pharmacy-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowMedicineForm(false); }}>
        <section className="pharmacy-modal" role="dialog" aria-modal="true" aria-labelledby="medicine-modal-title">
          <div className="pharmacy-modal-head"><div><span className="pharmacy-eyebrow">CATALOGUE</span><h2 id="medicine-modal-title">Add medicine</h2></div><button className="pharmacy-icon-btn" onClick={() => setShowMedicineForm(false)} aria-label="Close">Ã—</button></div>
          <form onSubmit={submitMedicine} className="pharmacy-form">
            <label>Medicine name *<input required value={medicineForm.name} onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })} placeholder="e.g. Aspirin" /></label>
            <label>Generic name<input value={medicineForm.genericName} onChange={(e) => setMedicineForm({ ...medicineForm, genericName: e.target.value })} placeholder="Generic name" /></label>
            <div className="pharmacy-form-row"><label>Dosage form<input value={medicineForm.dosageForm} onChange={(e) => setMedicineForm({ ...medicineForm, dosageForm: e.target.value })} placeholder="Tablet, syrup..." /></label><label>Strength<input value={medicineForm.strength} onChange={(e) => setMedicineForm({ ...medicineForm, strength: e.target.value })} placeholder="e.g. 75 mg" /></label></div>
            <label>Manufacturer<input value={medicineForm.manufacturer} onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })} placeholder="Manufacturer name" /></label>
            <div className="pharmacy-modal-actions"><button type="button" className="pharmacy-btn" onClick={() => setShowMedicineForm(false)}>Cancel</button><button className="pharmacy-btn pharmacy-btn-primary" disabled={saving}>{saving ? "Savingâ€¦" : "Save medicine"}</button></div>
          </form>
        </section>
      </div>}

      {showBatchForm && <div className="pharmacy-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowBatchForm(false); }}>
        <section className="pharmacy-modal" role="dialog" aria-modal="true" aria-labelledby="batch-modal-title">
          <div className="pharmacy-modal-head"><div><span className="pharmacy-eyebrow">INVENTORY</span><h2 id="batch-modal-title">Add stock batch</h2></div><button className="pharmacy-icon-btn" onClick={() => setShowBatchForm(false)} aria-label="Close">Ã—</button></div>
          <form onSubmit={submitBatch} className="pharmacy-form">
            <label>Medicine *<select required value={batchForm.medicineId} onChange={(e) => setBatchForm({ ...batchForm, medicineId: e.target.value })}><option value="">Select medicine</option>{medicines.map((medicine) => <option key={medicine.id} value={medicine.id}>{medicine.name} {medicine.strength || ""}</option>)}</select></label>
            <div className="pharmacy-form-row"><label>Batch number *<input required value={batchForm.batchNumber} onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })} placeholder="e.g. ASP-2026-01" /></label><label>Expiry date *<input required type="date" min={new Date().toISOString().slice(0, 10)} value={batchForm.expiryDate} onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })} /></label></div>
            <div className="pharmacy-form-row"><label>Initial quantity *<input required type="number" min="1" step="1" value={batchForm.quantityAvailable} onChange={(e) => setBatchForm({ ...batchForm, quantityAvailable: e.target.value })} /></label><label>Reorder level *<input required type="number" min="0" step="1" value={batchForm.reorderLevel} onChange={(e) => setBatchForm({ ...batchForm, reorderLevel: e.target.value })} /></label></div>
            <div className="pharmacy-form-row"><label>Purchase price (â‚¹) *<input required type="number" min="0" step="0.01" value={batchForm.purchasePrice} onChange={(e) => setBatchForm({ ...batchForm, purchasePrice: e.target.value })} /></label><label>Selling price (â‚¹) *<input required type="number" min="0" step="0.01" value={batchForm.sellingPrice} onChange={(e) => setBatchForm({ ...batchForm, sellingPrice: e.target.value })} /></label></div>
            {!medicines.length && <p className="pharmacy-form-hint">Add a medicine to the catalogue first.</p>}
            <div className="pharmacy-modal-actions"><button type="button" className="pharmacy-btn" onClick={() => setShowBatchForm(false)}>Cancel</button><button className="pharmacy-btn pharmacy-btn-primary" disabled={saving || !medicines.length}>{saving ? "Savingâ€¦" : "Save stock batch"}</button></div>
          </form>
        </section>
      </div>}

      {dispenseBatch && <div className="pharmacy-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setDispenseBatch(null); }}>
        <section className="pharmacy-modal" role="dialog" aria-modal="true" aria-labelledby="dispense-modal-title">
          <div className="pharmacy-modal-head"><div><span className="pharmacy-eyebrow">STOCK ISSUE</span><h2 id="dispense-modal-title">Dispense medicine</h2><p>{dispenseBatch.medicineName} Â· Batch {dispenseBatch.batchNumber}</p></div><button className="pharmacy-icon-btn" onClick={() => setDispenseBatch(null)} aria-label="Close">Ã—</button></div>
          <div className="pharmacy-available"><span>Available quantity</span><strong>{dispenseBatch.quantityAvailable} units</strong></div>
          <form onSubmit={submitDispense} className="pharmacy-form">
            <label>Quantity to dispense *<input autoFocus required type="number" min="1" max={dispenseBatch.quantityAvailable} step="1" value={dispenseQuantity} onChange={(e) => setDispenseQuantity(e.target.value)} /></label>
            <label className="pharmacy-checkbox"><input type="checkbox" checked={linkPrescription} onChange={(e) => setLinkPrescription(e.target.checked)} /><span>Link to a signed prescription item</span></label>
            {linkPrescription && <label>Prescription item ID *<input required value={prescriptionItemId} onChange={(e) => setPrescriptionItemId(e.target.value)} placeholder="Paste prescription item UUID" /><small>Use the prescription item ID, not the prescription ID. The backend validates the signed prescription and prescribed quantity.</small></label>}
            <p className="pharmacy-form-hint">This action updates stock immediately. Confirm the medicine and quantity before saving.</p>
            <div className="pharmacy-modal-actions"><button type="button" className="pharmacy-btn" onClick={() => setDispenseBatch(null)}>Cancel</button><button className="pharmacy-btn pharmacy-btn-primary" disabled={saving}>{saving ? "Recordingâ€¦" : "Confirm dispense"}</button></div>
          </form>
        </section>
      </div>}
    </main>
  );
}
