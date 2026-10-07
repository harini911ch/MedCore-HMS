package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.PrescriptionResponse;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class PrescriptionPdfService {

    private final PrescriptionService prescriptionService;

    public PrescriptionPdfService(
            PrescriptionService prescriptionService
    ) {
        this.prescriptionService = prescriptionService;
    }

    public byte[] generatePdf(java.util.UUID prescriptionId) {

        PrescriptionResponse prescription =
                prescriptionService.getPrescription(
                        prescriptionId
                );

        try (
                PDDocument document = new PDDocument();
                ByteArrayOutputStream outputStream =
                        new ByteArrayOutputStream()
        ) {

            PDPage page = new PDPage();
            document.addPage(page);

            PDType1Font boldFont =
                    new PDType1Font(
                            Standard14Fonts.FontName.HELVETICA_BOLD
                    );

            PDType1Font normalFont =
                    new PDType1Font(
                            Standard14Fonts.FontName.HELVETICA
                    );

            try (
                    PDPageContentStream content =
                            new PDPageContentStream(
                                    document,
                                    page
                            )
            ) {

                float y = 750;

                content.beginText();
                content.setFont(boldFont, 18);
                content.newLineAtOffset(50, y);
                content.showText("MedCore General Hospital");
                content.endText();

                y -= 35;

                content.beginText();
                content.setFont(boldFont, 14);
                content.newLineAtOffset(50, y);
                content.showText("MEDICAL PRESCRIPTION");
                content.endText();

                y -= 35;

                y = writeLine(
                        content,
                        normalFont,
                        "Prescription ID: "
                                + prescription.getId(),
                        y
                );

                y = writeLine(
                        content,
                        normalFont,
                        "Patient: "
                                + prescription.getPatientName(),
                        y
                );

                y = writeLine(
                        content,
                        normalFont,
                        "Doctor: "
                                + prescription.getDoctorName(),
                        y
                );

                y = writeLine(
                        content,
                        normalFont,
                        "Medical Record ID: "
                                + prescription.getMedicalRecordId(),
                        y
                );

                y -= 20;

                content.beginText();
                content.setFont(boldFont, 12);
                content.newLineAtOffset(50, y);
                content.showText("Medicines");
                content.endText();

                y -= 25;

                List<PrescriptionResponse.ItemResponse> items =
                        prescription.getItems();

                int number = 1;

                for (
                        PrescriptionResponse.ItemResponse item :
                        items
                ) {

                    y = writeLine(
                            content,
                            boldFont,
                            number + ". "
                                    + item.getMedicineName()
                                    + " "
                                    + safe(item.getStrength()),
                            y
                    );

                    y = writeLine(
                            content,
                            normalFont,
                            "   Dosage: "
                                    + item.getDosage(),
                            y
                    );

                    y = writeLine(
                            content,
                            normalFont,
                            "   Frequency: "
                                    + item.getFrequency(),
                            y
                    );

                    y = writeLine(
                            content,
                            normalFont,
                            "   Duration: "
                                    + item.getDuration(),
                            y
                    );

                    if (item.getQuantity() != null) {

                        y = writeLine(
                                content,
                                normalFont,
                                "   Quantity: "
                                        + item.getQuantity(),
                                y
                        );
                    }

                    if (item.getInstructions() != null &&
                            !item.getInstructions().isBlank()) {

                        y = writeLine(
                                content,
                                normalFont,
                                "   Instructions: "
                                        + item.getInstructions(),
                                y
                        );
                    }

                    y -= 10;
                    number++;
                }

                y -= 10;

                content.beginText();
                content.setFont(boldFont, 11);
                content.newLineAtOffset(50, y);

                if (prescription.isSigned()) {
                    content.showText(
                            "Digitally signed: YES"
                    );
                } else {
                    content.showText(
                            "Digitally signed: NO"
                    );
                }

                content.endText();

                if (prescription.getSignedAt() != null) {

                    y -= 18;

                    y = writeLine(
                            content,
                            normalFont,
                            "Signed at: "
                                    + prescription.getSignedAt(),
                            y
                    );
                }

                if (prescription.getSignatureHash() != null) {

                    y -= 5;

                    writeLine(
                            content,
                            normalFont,
                            "Signature hash: "
                                    + prescription.getSignatureHash(),
                            y
                    );
                }

                y = 70;

                content.beginText();
                content.setFont(normalFont, 10);
                content.newLineAtOffset(50, y);
                content.showText(
                        "This prescription was generated by MedCore HMS."
                );
                content.endText();
            }

            document.save(outputStream);

            return outputStream.toByteArray();

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Unable to generate prescription PDF"
            );
        }
    }

    private float writeLine(
            PDPageContentStream content,
            PDType1Font font,
            String text,
            float y
    ) throws IOException {

        content.beginText();
        content.setFont(font, 10);
        content.newLineAtOffset(50, y);
        content.showText(safe(text));
        content.endText();

        return y - 18;
    }

    private String safe(String value) {

        if (value == null) {
            return "";
        }

        return value.replace(
                "\u2013",
                "-"
        ).replace(
                "\u2014",
                "-"
        );
    }
}