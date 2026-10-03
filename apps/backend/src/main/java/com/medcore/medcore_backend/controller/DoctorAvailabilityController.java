package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.DoctorAvailabilityRequest;
import com.medcore.medcore_backend.dto.DoctorAvailabilityResponse;
import com.medcore.medcore_backend.service.DoctorAvailabilityService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;

    public DoctorAvailabilityController(
            DoctorAvailabilityService availabilityService
    ) {
        this.availabilityService = availabilityService;
    }

    @PostMapping("/{doctorId}/availability")
    public ResponseEntity<DoctorAvailabilityResponse> createAvailability(
            @PathVariable UUID doctorId,
            @RequestBody DoctorAvailabilityRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        availabilityService.createAvailability(
                                doctorId,
                                request
                        )
                );
    }

    @GetMapping("/{doctorId}/availability")
    public ResponseEntity<List<DoctorAvailabilityResponse>>
    getDoctorAvailability(
            @PathVariable UUID doctorId
    ) {
        return ResponseEntity.ok(
                availabilityService.getDoctorAvailability(doctorId)
        );
    }
}