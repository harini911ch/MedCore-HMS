package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.LabResult;

import java.time.LocalDateTime;
import java.util.UUID;

public class LabResultResponse {

    private UUID id;
    private UUID labOrderId;
    private UUID labTestId;
    private String resultValue;
    private String unit;
    private String referenceRange;
    private String remarks;
    private LabResult.Status status;
    private LocalDateTime resultedAt;
    private LocalDateTime createdAt;

    public LabResultResponse(LabResult result) {
        this.id = result.getId();
        this.labOrderId = result.getLabOrderId();
        this.labTestId = result.getLabTestId();
        this.resultValue = result.getResultValue();
        this.unit = result.getUnit();
        this.referenceRange = result.getReferenceRange();
        this.remarks = result.getRemarks();
        this.status = result.getStatus();
        this.resultedAt = result.getResultedAt();
        this.createdAt = result.getCreatedAt();
    }

    public UUID getId() {
        return id;
    }

    public UUID getLabOrderId() {
        return labOrderId;
    }

    public UUID getLabTestId() {
        return labTestId;
    }

    public String getResultValue() {
        return resultValue;
    }

    public String getUnit() {
        return unit;
    }

    public String getReferenceRange() {
        return referenceRange;
    }

    public String getRemarks() {
        return remarks;
    }

    public LabResult.Status getStatus() {
        return status;
    }

    public LocalDateTime getResultedAt() {
        return resultedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}