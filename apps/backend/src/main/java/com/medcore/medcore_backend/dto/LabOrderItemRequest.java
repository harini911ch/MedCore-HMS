package com.medcore.medcore_backend.dto;

import java.util.UUID;

public class LabOrderItemRequest {

    private UUID labTestId;

    public UUID getLabTestId() {
        return labTestId;
    }

    public void setLabTestId(UUID labTestId) {
        this.labTestId = labTestId;
    }
}