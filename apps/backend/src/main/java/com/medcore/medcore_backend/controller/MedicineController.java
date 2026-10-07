package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.MedicineRequest;
import com.medcore.medcore_backend.dto.MedicineResponse;
import com.medcore.medcore_backend.service.MedicineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @PostMapping
    public ResponseEntity<MedicineResponse> createMedicine(
            @RequestBody MedicineRequest request
    ) {
        return ResponseEntity.ok(
                medicineService.createMedicine(request)
        );
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<MedicineResponse>> getMedicines(
            @PathVariable UUID hospitalId
    ) {
        return ResponseEntity.ok(
                medicineService.getMedicines(hospitalId)
        );
    }

    @GetMapping("/hospital/{hospitalId}/search")
    public ResponseEntity<List<MedicineResponse>> searchMedicines(
            @PathVariable UUID hospitalId,
            @RequestParam String name
    ) {
        return ResponseEntity.ok(
                medicineService.searchMedicines(hospitalId, name)
        );
    }
}