
package com.medcore.medcore_backend.dto;

import java.util.UUID;

public class PharmacyPrescriptionDispenseRequest {

    private UUID prescriptionItemId;
    private Integer quantity;

    public UUID getPrescriptionItemId() {
        return prescriptionItemId;
    }

    public void setPrescriptionItemId(UUID prescriptionItemId) {
        this.prescriptionItemId = prescriptionItemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}