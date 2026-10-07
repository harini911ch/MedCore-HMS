package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrescriptionRepository
        extends JpaRepository<Prescription, UUID> {

    List<Prescription> findByPatientIdOrderByCreatedAtDesc(
            UUID patientId
    );

    List<Prescription> findByDoctorIdOrderByCreatedAtDesc(
            UUID doctorId
    );

    List<Prescription> findByMedicalRecordIdOrderByCreatedAtDesc(
            UUID medicalRecordId
    );
}