package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.LabTestRequest;
import com.medcore.medcore_backend.dto.LabTestResponse;
import com.medcore.medcore_backend.service.LabTestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lab-tests")
public class LabTestController {

    private final LabTestService labTestService;

    public LabTestController(LabTestService labTestService) {
        this.labTestService = labTestService;
    }

    @PostMapping
    public ResponseEntity<LabTestResponse> createTest(
            @RequestBody LabTestRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(labTestService.createTest(request));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<LabTestResponse>> getHospitalTests(
            @PathVariable UUID hospitalId
    ) {
        return ResponseEntity.ok(
                labTestService.getHospitalTests(hospitalId)
        );
    }
}