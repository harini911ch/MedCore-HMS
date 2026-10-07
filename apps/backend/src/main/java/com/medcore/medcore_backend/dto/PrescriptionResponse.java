package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.Prescription;
import com.medcore.medcore_backend.entity.PrescriptionItem;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class PrescriptionResponse {

    private UUID id;
    private UUID hospitalId;
    private UUID patientId;
    private String patientName;
    private UUID doctorId;
    private String doctorName;
    private UUID medicalRecordId;

    private boolean signed;
    private LocalDateTime signedAt;
    private String signatureHash;
    private LocalDateTime createdAt;

    private List<ItemResponse> items;

    public static class ItemResponse {

        private UUID id;
        private UUID medicineId;
        private String medicineName;
        private String genericName;
        private String strength;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
        private Integer quantity;

        public ItemResponse(PrescriptionItem item) {

            this.id = item.getId();
            this.medicineId = item.getMedicine().getId();
            this.medicineName = item.getMedicine().getName();
            this.genericName = item.getMedicine().getGenericName();
            this.strength = item.getMedicine().getStrength();
            this.dosage = item.getDosage();
            this.frequency = item.getFrequency();
            this.duration = item.getDuration();
            this.instructions = item.getInstructions();
            this.quantity = item.getQuantity();
        }

        public UUID getId() {
            return id;
        }

        public UUID getMedicineId() {
            return medicineId;
        }

        public String getMedicineName() {
            return medicineName;
        }

        public String getGenericName() {
            return genericName;
        }

        public String getStrength() {
            return strength;
        }

        public String getDosage() {
            return dosage;
        }

        public String getFrequency() {
            return frequency;
        }

        public String getDuration() {
            return duration;
        }

        public String getInstructions() {
            return instructions;
        }

        public Integer getQuantity() {
            return quantity;
        }
    }

    public static PrescriptionResponse fromEntity(
            Prescription prescription,
            List<PrescriptionItem> items
    ) {

        PrescriptionResponse response = new PrescriptionResponse();

        response.id = prescription.getId();
        response.hospitalId = prescription.getHospital().getId();
        response.patientId = prescription.getPatient().getId();
        response.patientName = prescription.getPatient().getFullName();
        response.doctorId = prescription.getDoctor().getId();
        response.doctorName = prescription.getDoctor().getUser().getFullName();
        response.medicalRecordId = prescription.getMedicalRecord().getId();

        response.signed = prescription.isSigned();
        response.signedAt = prescription.getSignedAt();
        response.signatureHash = prescription.getSignatureHash();
        response.createdAt = prescription.getCreatedAt();

        response.items = items.stream()
                .map(ItemResponse::new)
                .toList();

        return response;
    }

    public UUID getId() {
        return id;
    }

    public UUID getHospitalId() {
        return hospitalId;
    }

    public UUID getPatientId() {
        return patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public UUID getDoctorId() {
        return doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public UUID getMedicalRecordId() {
        return medicalRecordId;
    }

    public boolean isSigned() {
        return signed;
    }

    public LocalDateTime getSignedAt() {
        return signedAt;
    }

    public String getSignatureHash() {
        return signatureHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<ItemResponse> getItems() {
        return items;
    }
}