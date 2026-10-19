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

    @GetMapping("/doctor/me")
    public ResponseEntity<List<AppointmentResponse>> getMyDoctorAppointments() {
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication();

        return ResponseEntity.ok(
                appointmentService.getDoctorAppointmentsForUser(
                        authentication.getName()));
    }

    @PatchMapping("/doctor/{appointmentId}/status")
    public ResponseEntity<AppointmentResponse> updateDoctorAppointmentStatus(
            @PathVariable UUID appointmentId,
            @RequestParam AppointmentStatus status
    ) {
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication();

        return ResponseEntity.ok(
                appointmentService.updateDoctorAppointmentStatus(
                        authentication.getName(),
                        appointmentId,
                        status));
    }
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> getPatientAppointments(
            @PathVariable UUID patientId
    ) {
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication();

        return ResponseEntity.ok(
                appointmentService.getPatientAppointmentsForUser(
                        authentication.getName(), patientId)
        );
    }

    @PatchMapping("/{appointmentId}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable UUID appointmentId,
            @RequestParam AppointmentStatus status
    ) {
        requireAppointmentAdminRole();

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
        requireAppointmentAdminRole();

        appointmentService.softDelete(appointmentId);
        return ResponseEntity.noContent().build();
    }

    private void requireAppointmentAdminRole() {
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication();

        boolean authorized = authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities().stream()
                        .anyMatch(authority ->
                                authority.getAuthority().equals("ROLE_SUPER_ADMIN")
                                || authority.getAuthority().equals("ROLE_HOSPITAL_ADMIN")
                                || authority.getAuthority().equals("SUPER_ADMIN")
                                || authority.getAuthority().equals("HOSPITAL_ADMIN"));

        if (!authorized) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Only hospital administrators can manage appointment status or deletion");
        }
    }
}
