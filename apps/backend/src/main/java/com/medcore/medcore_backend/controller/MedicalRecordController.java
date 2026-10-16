package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.MedicalRecordRequest;
import com.medcore.medcore_backend.dto.MedicalRecordResponse;
import com.medcore.medcore_backend.service.MedicalRecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(
            MedicalRecordService medicalRecordService
    ) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping
    public ResponseEntity<MedicalRecordResponse> createMedicalRecord(
            @RequestBody MedicalRecordRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(medicalRecordService.createMedicalRecord(
                        request,
                        userDetails.getUsername()
                ));
    }

    @GetMapping("/{recordId}")
    public ResponseEntity<MedicalRecordResponse> getMedicalRecord(
            @PathVariable UUID recordId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                medicalRecordService.getMedicalRecord(
                        recordId,
                        userDetails.getUsername()
                )
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordResponse>> getPatientRecords(
            @PathVariable UUID patientId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                medicalRecordService.getPatientRecords(
                        patientId,
                        userDetails.getUsername()
                )
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<MedicalRecordResponse>> getDoctorRecords(
            @PathVariable UUID doctorId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                medicalRecordService.getDoctorRecords(
                        doctorId,
                        userDetails.getUsername()
                )
        );
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<MedicalRecordResponse>> getHospitalRecords(
            @PathVariable UUID hospitalId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                medicalRecordService.getHospitalRecords(
                        hospitalId,
                        userDetails.getUsername()
                )
        );
    }
}