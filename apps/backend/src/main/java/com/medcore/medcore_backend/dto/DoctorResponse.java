package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.Doctor;

import java.time.LocalDateTime;
import java.util.UUID;

public class DoctorResponse {

    private UUID id;
    private UUID userId;
    private String doctorName;
    private UUID hospitalId;
    private UUID departmentId;
    private String departmentName;
    private String specialization;
    private String licenseNumber;
    private String qualification;
    private String experience;
    private String bio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DoctorResponse() {
    }

    public DoctorResponse(Doctor doctor) {

        this.id = doctor.getId();
        this.userId = doctor.getUser().getId();
        this.doctorName = doctor.getUser().getFullName();
        this.hospitalId = doctor.getHospital().getId();
        this.departmentId = doctor.getDepartment().getId();
        this.departmentName = doctor.getDepartment().getName();
        this.specialization = doctor.getSpecialization();
        this.licenseNumber = doctor.getLicenseNumber();
        this.qualification = doctor.getQualification();
        this.experience = doctor.getExperience();
        this.bio = doctor.getBio();
        this.createdAt = doctor.getCreatedAt();
        this.updatedAt = doctor.getUpdatedAt();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public UUID getHospitalId() {
        return hospitalId;
    }

    public UUID getDepartmentId() {
        return departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public String getQualification() {
        return qualification;
    }

    public String getExperience() {
        return experience;
    }

    public String getBio() {
        return bio;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}