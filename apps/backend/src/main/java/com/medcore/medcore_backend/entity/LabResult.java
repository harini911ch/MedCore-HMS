package com.medcore.medcore_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lab_results")
public class LabResult {

    public enum Status {
        PENDING,
        READY,
        VERIFIED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "lab_order_id", nullable = false)
    private UUID labOrderId;

    @Column(name = "lab_test_id", nullable = false)
    private UUID labTestId;

    @Column(length = 2000)
    private String resultValue;

    @Column(length = 100)
    private String unit;

    @Column(name = "reference_range", length = 200)
    private String referenceRange;

    @Column(length = 1000)
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(name = "resulted_at")
    private LocalDateTime resultedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getLabOrderId() {
        return labOrderId;
    }

    public void setLabOrderId(UUID labOrderId) {
        this.labOrderId = labOrderId;
    }

    public UUID getLabTestId() {
        return labTestId;
    }

    public void setLabTestId(UUID labTestId) {
        this.labTestId = labTestId;
    }

    public String getResultValue() {
        return resultValue;
    }

    public void setResultValue(String resultValue) {
        this.resultValue = resultValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getReferenceRange() {
        return referenceRange;
    }

    public void setReferenceRange(String referenceRange) {
        this.referenceRange = referenceRange;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getResultedAt() {
        return resultedAt;
    }

    public void setResultedAt(LocalDateTime resultedAt) {
        this.resultedAt = resultedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}