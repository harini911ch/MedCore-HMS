package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.PatientRequest;
import com.medcore.medcore_backend.dto.PatientResponse;
import com.medcore.medcore_backend.service.PatientService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public ResponseEntity<PatientResponse> createPatient(
            @RequestBody PatientRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(patientService.createPatient(request));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<PatientResponse>> getPatients(
            @PathVariable UUID hospitalId) {

        return ResponseEntity.ok(
                patientService.getPatients(hospitalId));
    }

    @GetMapping("/me")
    public ResponseEntity<PatientResponse> getMyPatientProfile() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return ResponseEntity.ok(
                patientService.getPatientByUserEmail(
                        authentication.getName()));
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<PatientResponse> getPatient(
            @PathVariable UUID patientId) {

        return ResponseEntity.ok(
                patientService.getPatient(patientId));
    }
}
