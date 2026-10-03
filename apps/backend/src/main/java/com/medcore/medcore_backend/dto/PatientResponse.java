package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.Patient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class PatientResponse {

    private UUID id;
    private UUID userId;
    private UUID hospitalId;
    private String patientNumber;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String emergencyContact;
    private String bloodGroup;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PatientResponse(Patient patient) {
        this.id = patient.getId();

        if (patient.getUser() != null) {
            this.userId = patient.getUser().getId();
        }

        this.hospitalId = patient.getHospital().getId();
        this.patientNumber = patient.getPatientNumber();
        this.fullName = patient.getFullName();
        this.email = patient.getEmail();
        this.phone = patient.getPhone();
        this.dateOfBirth = patient.getDateOfBirth();
        this.gender = patient.getGender();
        this.address = patient.getAddress();
        this.emergencyContact = patient.getEmergencyContact();
        this.bloodGroup = patient.getBloodGroup();
        this.createdAt = patient.getCreatedAt();
        this.updatedAt = patient.getUpdatedAt();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getHospitalId() {
        return hospitalId;
    }

    public String getPatientNumber() {
        return patientNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public String getAddress() {
        return address;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}