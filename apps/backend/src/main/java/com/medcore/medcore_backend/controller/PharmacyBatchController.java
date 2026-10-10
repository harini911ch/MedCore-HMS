
package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.PharmacyBatchRequest;
import com.medcore.medcore_backend.dto.PharmacyBatchResponse;
import com.medcore.medcore_backend.service.PharmacyBatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pharmacy/batches")
public class PharmacyBatchController {

    private final PharmacyBatchService pharmacyBatchService;

    public PharmacyBatchController(
            PharmacyBatchService pharmacyBatchService
    ) {
        this.pharmacyBatchService = pharmacyBatchService;
    }

    @PostMapping
    public ResponseEntity<PharmacyBatchResponse> createBatch(
            @RequestBody PharmacyBatchRequest request
    ) {
        return ResponseEntity.ok(
                pharmacyBatchService.createBatch(request)
        );
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<PharmacyBatchResponse>> getBatchesByHospital(
            @PathVariable UUID hospitalId
    ) {
        return ResponseEntity.ok(
                pharmacyBatchService.getBatchesByHospital(hospitalId)
        );
    }

    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<List<PharmacyBatchResponse>> getBatchesByMedicine(
            @PathVariable UUID medicineId
    ) {
        return ResponseEntity.ok(
                pharmacyBatchService.getBatchesByMedicine(medicineId)
        );
    }
}