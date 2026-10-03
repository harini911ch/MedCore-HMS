package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.Appointment;
import com.medcore.medcore_backend.entity.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public class AppointmentResponse {

    private UUID id;
    private UUID hospitalId;
    private UUID doctorId;
    private String doctorName;
    private UUID patientId;
    private String patientName;

    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private String reason;
    private AppointmentStatus status;
    private boolean emergency;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AppointmentResponse fromEntity(Appointment appointment) {

        AppointmentResponse response = new AppointmentResponse();

        response.id = appointment.getId();
        response.hospitalId = appointment.getHospital().getId();

        response.doctorId = appointment.getDoctor().getId();
        response.doctorName = appointment.getDoctor().getUser().getFullName();

        response.patientId = appointment.getPatient().getId();
        response.patientName = appointment.getPatient().getFullName();

        response.appointmentDate = appointment.getAppointmentDate();
        response.startTime = appointment.getStartTime();
        response.endTime = appointment.getEndTime();

        response.reason = appointment.getReason();
        response.status = appointment.getStatus();
        response.emergency = appointment.isEmergency();

        response.createdAt = appointment.getCreatedAt();
        response.updatedAt = appointment.getUpdatedAt();

        return response;
    }

    public UUID getId() {
        return id;
    }

    public UUID getHospitalId() {
        return hospitalId;
    }

    public UUID getDoctorId() {
        return doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public UUID getPatientId() {
        return patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public String getReason() {
        return reason;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public boolean isEmergency() {
        return emergency;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}