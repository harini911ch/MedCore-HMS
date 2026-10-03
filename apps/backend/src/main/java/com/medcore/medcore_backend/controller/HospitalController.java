package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.HospitalRequest;
import com.medcore.medcore_backend.dto.HospitalResponse;
import com.medcore.medcore_backend.service.HospitalService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @PostMapping
    public ResponseEntity<HospitalResponse> createHospital(
            @RequestBody HospitalRequest request) {

        HospitalResponse response = hospitalService.createHospital(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<HospitalResponse>> getAllHospitals() {

        return ResponseEntity.ok(
                hospitalService.getAllHospitals()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalResponse> getHospitalById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                hospitalService.getHospitalById(id)
        );
    }
}