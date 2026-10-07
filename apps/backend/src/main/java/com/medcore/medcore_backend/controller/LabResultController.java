package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.LabResultRequest;
import com.medcore.medcore_backend.dto.LabResultResponse;
import com.medcore.medcore_backend.service.LabResultService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lab-results")
public class LabResultController {

    private final LabResultService labResultService;

    public LabResultController(LabResultService labResultService) {
        this.labResultService = labResultService;
    }

    @PostMapping
    public ResponseEntity<LabResultResponse> createResult(
            @RequestBody LabResultRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(labResultService.createResult(request));
    }

    @GetMapping("/{resultId}")
    public ResponseEntity<LabResultResponse> getResult(
            @PathVariable UUID resultId
    ) {
        return ResponseEntity.ok(
                labResultService.getResult(resultId)
        );
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<LabResultResponse>> getOrderResults(
            @PathVariable UUID orderId
    ) {
        return ResponseEntity.ok(
                labResultService.getOrderResults(orderId)
        );
    }
}