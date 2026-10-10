
package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.PharmacyBatch;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class PharmacyBatchResponse {

    private UUID id;
    private UUID hospitalId;
    private UUID medicineId;
    private String medicineName;
    private String medicineStrength;
    private String batchNumber;
    private LocalDate expiryDate;
    private Integer quantityAvailable;
    private Integer reorderLevel;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private boolean lowStock;
    private boolean expired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PharmacyBatchResponse(PharmacyBatch batch) {
        this.id = batch.getId();
        this.hospitalId = batch.getMedicine().getHospital().getId();
        this.medicineId = batch.getMedicine().getId();
        this.medicineName = batch.getMedicine().getName();
        this.medicineStrength = batch.getMedicine().getStrength();
        this.batchNumber = batch.getBatchNumber();
        this.expiryDate = batch.getExpiryDate();
        this.quantityAvailable = batch.getQuantityAvailable();
        this.reorderLevel = batch.getReorderLevel();
        this.purchasePrice = batch.getPurchasePrice();
        this.sellingPrice = batch.getSellingPrice();
        this.lowStock = batch.getQuantityAvailable()
                <= batch.getReorderLevel();
        this.expired = batch.getExpiryDate().isBefore(LocalDate.now());
        this.createdAt = batch.getCreatedAt();
        this.updatedAt = batch.getUpdatedAt();
    }

    public UUID getId() { return id; }
    public UUID getHospitalId() { return hospitalId; }
    public UUID getMedicineId() { return medicineId; }
    public String getMedicineName() { return medicineName; }
    public String getMedicineStrength() { return medicineStrength; }
    public String getBatchNumber() { return batchNumber; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public Integer getQuantityAvailable() { return quantityAvailable; }
    public Integer getReorderLevel() { return reorderLevel; }
    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public BigDecimal getSellingPrice() { return sellingPrice; }
    public boolean isLowStock() { return lowStock; }
    public boolean isExpired() { return expired; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}