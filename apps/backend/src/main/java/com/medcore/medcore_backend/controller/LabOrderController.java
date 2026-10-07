package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.LabOrderRequest;
import com.medcore.medcore_backend.dto.LabOrderResponse;
import com.medcore.medcore_backend.entity.LabOrder;
import com.medcore.medcore_backend.service.LabOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lab-orders")
public class LabOrderController {

    private final LabOrderService labOrderService;

    public LabOrderController(LabOrderService labOrderService) {
        this.labOrderService = labOrderService;
    }

    @PostMapping
    public ResponseEntity<LabOrderResponse> createOrder(
            @RequestBody LabOrderRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(labOrderService.createOrder(request));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<LabOrderResponse> getOrder(
            @PathVariable UUID orderId
    ) {
        return ResponseEntity.ok(
                labOrderService.getOrder(orderId)
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabOrderResponse>> getPatientOrders(
            @PathVariable UUID patientId
    ) {
        return ResponseEntity.ok(
                labOrderService.getPatientOrders(patientId)
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<LabOrderResponse>> getDoctorOrders(
            @PathVariable UUID doctorId
    ) {
        return ResponseEntity.ok(
                labOrderService.getDoctorOrders(doctorId)
        );
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<LabOrderResponse>> getHospitalOrders(
            @PathVariable UUID hospitalId
    ) {
        return ResponseEntity.ok(
                labOrderService.getHospitalOrders(hospitalId)
        );
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<LabOrderResponse> updateStatus(
            @PathVariable UUID orderId,
            @RequestParam LabOrder.Status status
    ) {
        return ResponseEntity.ok(
                labOrderService.updateStatus(orderId, status)
        );
    }
}