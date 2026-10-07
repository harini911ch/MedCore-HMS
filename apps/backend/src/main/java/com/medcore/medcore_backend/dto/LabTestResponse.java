package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.LabTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class LabTestResponse {

    private UUID id;
    private UUID hospitalId;
    private String name;
    private String description;
    private String sampleType;
    private BigDecimal price;
    private boolean active;
    private LocalDateTime createdAt;

    public LabTestResponse(LabTest labTest) {
        this.id = labTest.getId();
        this.hospitalId = labTest.getHospitalId();
        this.name = labTest.getName();
        this.description = labTest.getDescription();
        this.sampleType = labTest.getSampleType();
        this.price = labTest.getPrice();
        this.active = labTest.isActive();
        this.createdAt = labTest.getCreatedAt();
    }

    public UUID getId() {
        return id;
    }

    public UUID getHospitalId() {
        return hospitalId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getSampleType() {
        return sampleType;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}