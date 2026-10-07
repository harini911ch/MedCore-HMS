package com.medcore.medcore_backend.dto;

import java.util.UUID;

public class LabResultRequest {

    private UUID labOrderId;
    private UUID labTestId;
    private String resultValue;
    private String unit;
    private String referenceRange;
    private String remarks;

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
}