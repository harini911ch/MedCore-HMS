package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.InvoiceRequest;
import com.medcore.medcore_backend.dto.InvoiceResponse;
import com.medcore.medcore_backend.service.InvoiceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(
            @RequestBody InvoiceRequest request
    ) {
        InvoiceResponse response =
                invoiceService.createInvoice(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceResponse> getInvoice(
            @PathVariable UUID invoiceId
    ) {
        return ResponseEntity.ok(
                invoiceService.getInvoice(invoiceId)
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<InvoiceResponse>> getPatientInvoices(
            @PathVariable UUID patientId
    ) {
        return ResponseEntity.ok(
                invoiceService.getPatientInvoices(patientId)
        );
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<InvoiceResponse>> getHospitalInvoices(
            @PathVariable UUID hospitalId
    ) {
        return ResponseEntity.ok(
                invoiceService.getHospitalInvoices(hospitalId)
        );
    }

    @PatchMapping("/{invoiceId}/finalize")
    public ResponseEntity<InvoiceResponse> finalizeInvoice(
            @PathVariable UUID invoiceId
    ) {
        return ResponseEntity.ok(
                invoiceService.finalizeInvoice(invoiceId)
        );
    }
}