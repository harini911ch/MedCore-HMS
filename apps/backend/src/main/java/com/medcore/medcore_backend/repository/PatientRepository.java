package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientRepository
        extends JpaRepository<Patient, UUID> {

    List<Patient> findByHospitalIdAndDeletedAtIsNull(
            UUID hospitalId
    );

    Optional<Patient> findByIdAndDeletedAtIsNull(
            UUID patientId
    );

    boolean existsByHospitalIdAndPatientNumber(
            UUID hospitalId,
            String patientNumber
    );
Optional<Patient> findByUser_IdAndDeletedAtIsNull(UUID userId);
}