
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

    public PharmacyDispenseResponse(PharmacyDispense dispense) {
        this.id = dispense.getId();

        var batch = dispense.getBatch();

        this.hospitalId = batch.getMedicine().getHospital().getId();
        this.medicineId = batch.getMedicine().getId();
        this.batchId = batch.getId();
        this.medicineName = batch.getMedicine().getName();
        this.batchNumber = batch.getBatchNumber();
        this.quantityDispensed = dispense.getQuantityDispensed();
        this.remainingQuantity = dispense.getRemainingQuantity();
        this.lowStock = batch.getQuantityAvailable()
                <= batch.getReorderLevel();
        this.dispensedAt = dispense.getDispensedAt();
    }

    public UUID getId() {
        return id;
    }

    public UUID getHospitalId() {
        return hospitalId;
    }

    public UUID getMedicineId() {
        return medicineId;
    }

    public UUID getBatchId() {
        return batchId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public Integer getQuantityDispensed() {
        return quantityDispensed;
    }

    public Integer getRemainingQuantity() {
        return remainingQuantity;
    }

    public boolean isLowStock() {
        return lowStock;
    }

    public LocalDateTime getDispensedAt() {
        return dispensedAt;
    }
}

