
package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.PharmacyBatchRequest;
import com.medcore.medcore_backend.dto.PharmacyBatchResponse;
import com.medcore.medcore_backend.dto.PharmacyDispenseRequest;
import com.medcore.medcore_backend.dto.PharmacyDispenseResponse;
import com.medcore.medcore_backend.dto.PharmacyPrescriptionDispenseRequest;
import com.medcore.medcore_backend.service.PharmacyBatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pharmacy")
public class PharmacyBatchController {

    private final PharmacyBatchService pharmacyBatchService;

    public PharmacyBatchController(
            PharmacyBatchService pharmacyBatchService
    ) {
        this.pharmacyBatchService = pharmacyBatchService;
    }

    @PostMapping("/batches")
    public ResponseEntity<PharmacyBatchResponse> createBatch(
            @RequestBody PharmacyBatchRequest request
    ) {
        return ResponseEntity.ok(
                pharmacyBatchService.createBatch(request)
        );
    }

    @GetMapping("/batches/hospital/{hospitalId}")
    public ResponseEntity<List<PharmacyBatchResponse>> getBatchesByHospital(
            @PathVariable UUID hospitalId
    ) {
        return ResponseEntity.ok(
                pharmacyBatchService.getBatchesByHospital(hospitalId)
        );
    }

    @GetMapping("/batches/medicine/{medicineId}")
    public ResponseEntity<List<PharmacyBatchResponse>> getBatchesByMedicine(
            @PathVariable UUID medicineId
    ) {
        return ResponseEntity.ok(
                pharmacyBatchService.getBatchesByMedicine(medicineId)
        );
    }

    @PostMapping("/batches/{batchId}/dispense")
    public ResponseEntity<PharmacyDispenseResponse> dispenseMedicine(
            @PathVariable UUID batchId,
            @RequestBody PharmacyDispenseRequest request
    ) {
        return ResponseEntity.ok(
                pharmacyBatchService.dispenseMedicine(
                        batchId,
                        request
                )
        );
    }

    @PostMapping("/batches/{batchId}/dispense-prescription")
    public ResponseEntity<PharmacyDispenseResponse>
    dispenseAgainstPrescription(
            @PathVariable UUID batchId,
            @RequestBody PharmacyPrescriptionDispenseRequest request
    ) {
        return ResponseEntity.ok(
                pharmacyBatchService.dispenseAgainstPrescription(
                        batchId,
                        request
                )
        );
    }

    @GetMapping("/dispenses/hospital/{hospitalId}")
    public ResponseEntity<List<PharmacyDispenseResponse>>
    getDispensingHistory(
            @PathVariable UUID hospitalId
    ) {
        return ResponseEntity.ok(
                pharmacyBatchService.getDispensingHistory(hospitalId)
        );
    }
}