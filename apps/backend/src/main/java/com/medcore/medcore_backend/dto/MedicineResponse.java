package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.Medicine;

import java.time.LocalDateTime;
import java.util.UUID;

public class MedicineResponse {

    private UUID id;
    private UUID hospitalId;
    private String name;
    private String genericName;
    private String dosageForm;
    private String strength;
    private String manufacturer;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MedicineResponse fromEntity(Medicine medicine) {

        MedicineResponse response = new MedicineResponse();

        response.id = medicine.getId();
        response.hospitalId = medicine.getHospital().getId();
        response.name = medicine.getName();
        response.genericName = medicine.getGenericName();
        response.dosageForm = medicine.getDosageForm();
        response.strength = medicine.getStrength();
        response.manufacturer = medicine.getManufacturer();
        response.active = medicine.isActive();
        response.createdAt = medicine.getCreatedAt();
        response.updatedAt = medicine.getUpdatedAt();

        return response;
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

    public String getGenericName() {
        return genericName;
    }

    public String getDosageForm() {
        return dosageForm;
    }

    public String getStrength() {
        return strength;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}