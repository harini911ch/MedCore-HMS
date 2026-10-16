package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.DoctorRequest;
import com.medcore.medcore_backend.dto.DoctorResponse;
import com.medcore.medcore_backend.service.DoctorService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(
            DoctorService doctorService
    ) {
        this.doctorService = doctorService;
    }

    @PostMapping
    public ResponseEntity<DoctorResponse> createDoctor(
            @RequestBody DoctorRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        doctorService.createDoctor(request)
                );
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<DoctorResponse>> getDoctors(
            @PathVariable UUID hospitalId
    ) {
        return ResponseEntity.ok(
                doctorService.getDoctors(hospitalId)
        );
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<DoctorResponse>> getDoctorsByDepartment(
            @PathVariable UUID departmentId
    ) {
        return ResponseEntity.ok(
                doctorService.getDoctorsByDepartment(departmentId)
        );
    }

@GetMapping("/me")
public ResponseEntity<DoctorResponse> getMyDoctorProfile() {
    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    return ResponseEntity.ok(
            doctorService.getDoctorByUserEmail(
                    authentication.getName()
            )
    );
}
}