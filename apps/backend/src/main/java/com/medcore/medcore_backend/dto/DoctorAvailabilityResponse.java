package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.DoctorAvailability;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public class DoctorAvailabilityResponse {

    private UUID id;
    private UUID doctorId;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DoctorAvailabilityResponse(
            DoctorAvailability availability
    ) {
        this.id = availability.getId();
        this.doctorId = availability.getDoctor().getId();
        this.dayOfWeek = availability.getDayOfWeek();
        this.startTime = availability.getStartTime();
        this.endTime = availability.getEndTime();
        this.available = availability.isAvailable();
        this.createdAt = availability.getCreatedAt();
        this.updatedAt = availability.getUpdatedAt();
    }

    public UUID getId() {
        return id;
    }

    public UUID getDoctorId() {
        return doctorId;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public boolean isAvailable() {
        return available;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}