package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.AppointmentRequest;
import com.medcore.medcore_backend.dto.AppointmentResponse;
import com.medcore.medcore_backend.entity.AppointmentStatus;
import com.medcore.medcore_backend.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            @RequestBody AppointmentRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(appointmentService.createAppointment(request));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<AppointmentResponse>> getHospitalAppointments(
            @PathVariable UUID hospitalId
    ) {
        return ResponseEntity.ok(
                appointmentService.getHospitalAppointments(hospitalId)
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(
            @PathVariable UUID doctorId,
            @RequestParam LocalDate date
    ) {
        return ResponseEntity.ok(
                appointmentService.getDoctorAppointments(
                        doctorId,
                        date
                )
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> getPatientAppointments(
            @PathVariable UUID patientId
    ) {
        return ResponseEntity.ok(
                appointmentService.getPatientAppointments(patientId)
        );
    }

    @PatchMapping("/{appointmentId}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable UUID appointmentId,
            @RequestParam AppointmentStatus status
    ) {
        return ResponseEntity.ok(
                appointmentService.updateStatus(
                        appointmentId,
                        status
                )
        );
    }

    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable UUID appointmentId
    ) {
        appointmentService.softDelete(appointmentId);
        return ResponseEntity.noContent().build();
    }
}