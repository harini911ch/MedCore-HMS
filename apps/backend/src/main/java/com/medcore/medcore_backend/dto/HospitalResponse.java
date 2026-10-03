package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.Hospital;

import java.time.LocalDateTime;
import java.util.UUID;

public class HospitalResponse {

    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HospitalResponse() {
    }

    public HospitalResponse(Hospital hospital) {
        this.id = hospital.getId();
        this.name = hospital.getName();
        this.email = hospital.getEmail();
        this.phone = hospital.getPhone();
        this.address = hospital.getAddress();
        this.createdAt = hospital.getCreatedAt();
        this.updatedAt = hospital.getUpdatedAt();
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}