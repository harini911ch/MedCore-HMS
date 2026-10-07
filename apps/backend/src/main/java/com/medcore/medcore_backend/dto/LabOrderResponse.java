package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.LabOrder;

import java.time.LocalDateTime;
import java.util.UUID;

public class LabOrderResponse {

    private UUID id;
    private UUID hospitalId;
    private UUID patientId;
    private UUID doctorId;
    private UUID medicalRecordId;
    private LabOrder.Status status;
    private String clinicalNotes;
    private LocalDateTime orderedAt;
    private LocalDateTime completedAt;

    public LabOrderResponse(LabOrder order) {
        this.id = order.getId();
        this.hospitalId = order.getHospitalId();
        this.patientId = order.getPatientId();
        this.doctorId = order.getDoctorId();
        this.medicalRecordId = order.getMedicalRecordId();
        this.status = order.getStatus();
        this.clinicalNotes = order.getClinicalNotes();
        this.orderedAt = order.getOrderedAt();
        this.completedAt = order.getCompletedAt();
    }

    public UUID getId() {
        return id;
    }

    public UUID getHospitalId() {
        return hospitalId;
    }

    public UUID getPatientId() {
        return patientId;
    }

    public UUID getDoctorId() {
        return doctorId;
    }

    public UUID getMedicalRecordId() {
        return medicalRecordId;
    }

    public LabOrder.Status getStatus() {
        return status;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public LocalDateTime getOrderedAt() {
        return orderedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}