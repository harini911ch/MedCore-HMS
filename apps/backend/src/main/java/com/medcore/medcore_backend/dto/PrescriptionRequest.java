package com.medcore.medcore_backend.dto;

import java.util.List;
import java.util.UUID;

public class PrescriptionRequest {

    private UUID hospitalId;
    private UUID patientId;
    private UUID doctorId;
    private UUID medicalRecordId;

    private List<PrescriptionItemRequest> items;

    public UUID getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(UUID hospitalId) {
        this.hospitalId = hospitalId;
    }

    public UUID getPatientId() {
        return patientId;
    }

    public void setPatientId(UUID patientId) {
        this.patientId = patientId;
    }

    public UUID getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(UUID doctorId) {
        this.doctorId = doctorId;
    }

    public UUID getMedicalRecordId() {
        return medicalRecordId;
    }

    public void setMedicalRecordId(UUID medicalRecordId) {
        this.medicalRecordId = medicalRecordId;
    }

    public List<PrescriptionItemRequest> getItems() {
        return items;
    }

    public void setItems(List<PrescriptionItemRequest> items) {
        this.items = items;
    }
}