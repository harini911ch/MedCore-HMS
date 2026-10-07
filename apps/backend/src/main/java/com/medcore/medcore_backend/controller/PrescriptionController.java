package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.PrescriptionRequest;
import com.medcore.medcore_backend.dto.PrescriptionResponse;
import com.medcore.medcore_backend.service.PrescriptionPdfService;
import com.medcore.medcore_backend.service.PrescriptionService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final PrescriptionPdfService prescriptionPdfService;

    public PrescriptionController(
            PrescriptionService prescriptionService,
            PrescriptionPdfService prescriptionPdfService
    ) {
        this.prescriptionService = prescriptionService;
        this.prescriptionPdfService = prescriptionPdfService;
    }

    @PostMapping
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @RequestBody PrescriptionRequest request
    ) {

        return ResponseEntity.ok(
                prescriptionService.createPrescription(request)
        );
    }

    @GetMapping("/{prescriptionId}")
    public ResponseEntity<PrescriptionResponse> getPrescription(
            @PathVariable UUID prescriptionId
    ) {

        return ResponseEntity.ok(
                prescriptionService.getPrescription(
                        prescriptionId
                )
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionResponse>>
    getPatientPrescriptions(
            @PathVariable UUID patientId
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .getPatientPrescriptions(patientId)
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<PrescriptionResponse>>
    getDoctorPrescriptions(
            @PathVariable UUID doctorId
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .getDoctorPrescriptions(doctorId)
        );
    }

    @PatchMapping("/{prescriptionId}/sign")
    public ResponseEntity<PrescriptionResponse> signPrescription(
            @PathVariable UUID prescriptionId
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .signPrescription(prescriptionId)
        );
    }

    @GetMapping("/{prescriptionId}/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable UUID prescriptionId
    ) {

        byte[] pdf =
                prescriptionPdfService.generatePdf(
                        prescriptionId
                );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=prescription-"
                                + prescriptionId
                                + ".pdf"
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .body(pdf);
    }
}