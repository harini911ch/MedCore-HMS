package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.MedicalRecordRequest;
import com.medcore.medcore_backend.dto.MedicalRecordResponse;
import com.medcore.medcore_backend.service.MedicalRecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
            @RequestBody MedicalRecordRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        medicalRecordService.createMedicalRecord(request)
                );
    }

    @GetMapping("/{recordId}")
    public ResponseEntity<MedicalRecordResponse> getMedicalRecord(
            @PathVariable UUID recordId
    ) {
        return ResponseEntity.ok(
                medicalRecordService.getMedicalRecord(recordId)
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordResponse>> getPatientRecords(
            @PathVariable UUID patientId
    ) {
        return ResponseEntity.ok(
                medicalRecordService.getPatientRecords(patientId)
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<MedicalRecordResponse>> getDoctorRecords(
            @PathVariable UUID doctorId
    ) {
        return ResponseEntity.ok(
                medicalRecordService.getDoctorRecords(doctorId)
        );
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<MedicalRecordResponse>> getHospitalRecords(
            @PathVariable UUID hospitalId
    ) {
        return ResponseEntity.ok(
                medicalRecordService.getHospitalRecords(hospitalId)
        );
    }
}