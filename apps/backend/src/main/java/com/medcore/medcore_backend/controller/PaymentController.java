package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.PaymentRequest;
import com.medcore.medcore_backend.dto.PaymentResponse;
import com.medcore.medcore_backend.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{invoiceId}/payments")
    public ResponseEntity<PaymentResponse> recordPayment(
            @PathVariable UUID invoiceId,
            @RequestBody PaymentRequest request
    ) {
        PaymentResponse response =
                paymentService.recordPayment(invoiceId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{invoiceId}/payments")
    public ResponseEntity<List<PaymentResponse>> getInvoicePayments(
            @PathVariable UUID invoiceId
    ) {
        return ResponseEntity.ok(
                paymentService.getInvoicePayments(invoiceId)
        );
    }
}