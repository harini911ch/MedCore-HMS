
package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.PharmacyDispense;

import java.time.LocalDateTime;
import java.util.UUID;

public class PharmacyDispenseResponse {

    private UUID id;
    private UUID hospitalId;
    private UUID medicineId;
    private UUID batchId;
    private String medicineName;
    private String batchNumber;
    private Integer quantityDispensed;
    private Integer remainingQuantity;
    private boolean lowStock;
    private LocalDateTime dispensedAt;

    private UUID prescriptionItemId;
    private UUID prescriptionId;
    private UUID patientId;
    private String patientName;

    public PharmacyDispenseResponse(PharmacyDispense dispense) {
        this.id = dispense.getId();

        var batch = dispense.getBatch();
        var medicine = batch.getMedicine();

        this.hospitalId = medicine.getHospital().getId();
        this.medicineId = medicine.getId();
        this.batchId = batch.getId();
        this.medicineName = medicine.getName();
        this.batchNumber = batch.getBatchNumber();
        this.quantityDispensed = dispense.getQuantityDispensed();
        this.remainingQuantity = dispense.getRemainingQuantity();
        this.lowStock = batch.getQuantityAvailable()
                <= batch.getReorderLevel();
        this.dispensedAt = dispense.getDispensedAt();

        var item = dispense.getPrescriptionItem();

        if (item != null) {
            var prescription = item.getPrescription();
            var patient = prescription.getPatient();

            this.prescriptionItemId = item.getId();
            this.prescriptionId = prescription.getId();
            this.patientId = patient.getId();
            this.patientName = patient.getFullName();
        }
    }

    public UUID getId() { return id; }
    public UUID getHospitalId() { return hospitalId; }
    public UUID getMedicineId() { return medicineId; }
    public UUID getBatchId() { return batchId; }
    public String getMedicineName() { return medicineName; }
    public String getBatchNumber() { return batchNumber; }
    public Integer getQuantityDispensed() { return quantityDispensed; }
    public Integer getRemainingQuantity() { return remainingQuantity; }
    public boolean isLowStock() { return lowStock; }
    public LocalDateTime getDispensedAt() { return dispensedAt; }
    public UUID getPrescriptionItemId() { return prescriptionItemId; }
    public UUID getPrescriptionId() { return prescriptionId; }
    public UUID getPatientId() { return patientId; }
    public String getPatientName() { return patientName; }
}