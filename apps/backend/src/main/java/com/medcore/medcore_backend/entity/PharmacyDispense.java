
package com.medcore.medcore_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "pharmacy_dispenses",
    indexes = {
        @Index(name = "idx_pharmacy_dispense_batch", columnList = "batch_id"),
        @Index(name = "idx_pharmacy_dispense_date", columnList = "dispensed_at"),
        @Index(name = "idx_pharmacy_dispense_prescription_item",
               columnList = "prescription_item_id")
    }
)
public class PharmacyDispense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private PharmacyBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_item_id")
    private PrescriptionItem prescriptionItem;

    @Column(name = "quantity_dispensed", nullable = false)
    private Integer quantityDispensed;

    @Column(name = "remaining_quantity", nullable = false)
    private Integer remainingQuantity;

    @Column(name = "dispensed_at", nullable = false)
    private LocalDateTime dispensedAt;

    @PrePersist
    protected void onCreate() {
        if (dispensedAt == null) {
            dispensedAt = LocalDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public PharmacyBatch getBatch() {
        return batch;
    }

    public void setBatch(PharmacyBatch batch) {
        this.batch = batch;
    }

    public PrescriptionItem getPrescriptionItem() {
        return prescriptionItem;
    }

    public void setPrescriptionItem(PrescriptionItem prescriptionItem) {
        this.prescriptionItem = prescriptionItem;
    }

    public Integer getQuantityDispensed() {
        return quantityDispensed;
    }

    public void setQuantityDispensed(Integer quantityDispensed) {
        this.quantityDispensed = quantityDispensed;
    }

    public Integer getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(Integer remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
    }

    public LocalDateTime getDispensedAt() {
        return dispensedAt;
    }

    public LocalDateTime getCreatedAt() {
        return dispensedAt;
    }
}