package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.Department;

import java.time.LocalDateTime;
import java.util.UUID;

public class DepartmentResponse {

    private UUID id;
    private String name;
    private String description;
    private UUID hospitalId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DepartmentResponse() {
    }

    public DepartmentResponse(Department department) {
        this.id = department.getId();
        this.name = department.getName();
        this.description = department.getDescription();
        this.hospitalId = department.getHospital().getId();
        this.createdAt = department.getCreatedAt();
        this.updatedAt = department.getUpdatedAt();
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public UUID getHospitalId() {
        return hospitalId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}