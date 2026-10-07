package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.PrescriptionItemRequest;
import com.medcore.medcore_backend.dto.PrescriptionRequest;
import com.medcore.medcore_backend.dto.PrescriptionResponse;
import com.medcore.medcore_backend.entity.*;
import com.medcore.medcore_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final MedicineRepository medicineRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            PrescriptionItemRepository prescriptionItemRepository,
            MedicineRepository medicineRepository,
            HospitalRepository hospitalRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            MedicalRecordRepository medicalRecordRepository
    ) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.medicineRepository = medicineRepository;
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @Transactional
    public PrescriptionResponse createPrescription(
            PrescriptionRequest request
    ) {

        if (request.getItems() == null ||
                request.getItems().isEmpty()) {
            throw new RuntimeException(
                    "Prescription must contain at least one medicine"
            );
        }

        Hospital hospital = hospitalRepository
                .findById(request.getHospitalId())
                .orElseThrow(() ->
                        new RuntimeException("Hospital not found"));

        Patient patient = patientRepository
                .findByIdAndDeletedAtIsNull(request.getPatientId())
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository
                .findById(request.getDoctorId())
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        MedicalRecord medicalRecord = medicalRecordRepository
                .findById(request.getMedicalRecordId())
                .orElseThrow(() ->
                        new RuntimeException("Medical record not found"));

        if (!patient.getHospital().getId()
                .equals(hospital.getId())) {
            throw new RuntimeException(
                    "Patient does not belong to this hospital"
            );
        }

        if (!doctor.getHospital().getId()
                .equals(hospital.getId())) {
            throw new RuntimeException(
                    "Doctor does not belong to this hospital"
            );
        }

        if (!medicalRecord.getHospital().getId()
                .equals(hospital.getId())) {
            throw new RuntimeException(
                    "Medical record does not belong to this hospital"
            );
        }

        if (!medicalRecord.getPatient().getId()
                .equals(patient.getId())) {
            throw new RuntimeException(
                    "Medical record does not belong to this patient"
            );
        }

        if (!medicalRecord.getDoctor().getId()
                .equals(doctor.getId())) {
            throw new RuntimeException(
                    "Medical record does not belong to this doctor"
            );
        }

        Prescription prescription = new Prescription();

        prescription.setHospital(hospital);
        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setMedicalRecord(medicalRecord);
        prescription.setSigned(false);

        Prescription savedPrescription =
                prescriptionRepository.save(prescription);

        for (PrescriptionItemRequest itemRequest :
                request.getItems()) {

            Medicine medicine = medicineRepository
                    .findById(itemRequest.getMedicineId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Medicine not found: "
                                            + itemRequest.getMedicineId()
                            ));

            if (!medicine.getHospital().getId()
                    .equals(hospital.getId())) {
                throw new RuntimeException(
                        "Medicine does not belong to this hospital"
                );
            }

            if (!medicine.isActive()) {
                throw new RuntimeException(
                        "Medicine is inactive"
                );
            }

            if (itemRequest.getDosage() == null ||
                    itemRequest.getDosage().isBlank()) {
                throw new RuntimeException(
                        "Dosage is required"
                );
            }

            if (itemRequest.getFrequency() == null ||
                    itemRequest.getFrequency().isBlank()) {
                throw new RuntimeException(
                        "Frequency is required"
                );
            }

            if (itemRequest.getDuration() == null ||
                    itemRequest.getDuration().isBlank()) {
                throw new RuntimeException(
                        "Duration is required"
                );
            }

            PrescriptionItem item = new PrescriptionItem();

            item.setPrescription(savedPrescription);
            item.setMedicine(medicine);
            item.setDosage(itemRequest.getDosage());
            item.setFrequency(itemRequest.getFrequency());
            item.setDuration(itemRequest.getDuration());
            item.setInstructions(itemRequest.getInstructions());
            item.setQuantity(itemRequest.getQuantity());

            prescriptionItemRepository.save(item);
        }

        return getPrescription(savedPrescription.getId());
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescription(
            UUID prescriptionId
    ) {

        Prescription prescription = prescriptionRepository
                .findById(prescriptionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Prescription not found"
                        ));

        List<PrescriptionItem> items =
                prescriptionItemRepository
                        .findByPrescriptionId(prescriptionId);

        return PrescriptionResponse.fromEntity(
                prescription,
                items
        );
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPatientPrescriptions(
            UUID patientId
    ) {

        return prescriptionRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(prescription ->
                        getPrescription(prescription.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getDoctorPrescriptions(
            UUID doctorId
    ) {

        return prescriptionRepository
                .findByDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(prescription ->
                        getPrescription(prescription.getId()))
                .toList();
    }

    @Transactional
    public PrescriptionResponse signPrescription(
            UUID prescriptionId
    ) {

        Prescription prescription = prescriptionRepository
                .findById(prescriptionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Prescription not found"
                        ));

        if (prescription.isSigned()) {
            throw new RuntimeException(
                    "Prescription is already signed"
            );
        }

        List<PrescriptionItem> items =
                prescriptionItemRepository
                        .findByPrescriptionId(prescriptionId);

        StringBuilder signatureData = new StringBuilder();

        signatureData
                .append(prescription.getId())
                .append("|")
                .append(prescription.getDoctor().getId())
                .append("|")
                .append(prescription.getPatient().getId());

        for (PrescriptionItem item : items) {

            signatureData
                    .append("|")
                    .append(item.getMedicine().getId())
                    .append("|")
                    .append(item.getDosage())
                    .append("|")
                    .append(item.getFrequency())
                    .append("|")
                    .append(item.getDuration());
        }

        signatureData
                .append("|")
                .append(LocalDateTime.now());

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            String hash = HexFormat.of().formatHex(
                    digest.digest(
                            signatureData.toString()
                                    .getBytes(StandardCharsets.UTF_8)
                    )
            );

            prescription.setSignatureHash(hash);
            prescription.setSigned(true);
            prescription.setSignedAt(LocalDateTime.now());

            prescriptionRepository.save(prescription);

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to sign prescription"
            );
        }

        return getPrescription(prescriptionId);
    }
}