package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.Vital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VitalRepository extends JpaRepository<Vital, UUID> {

    Optional<Vital> findByMedicalRecordId(UUID medicalRecordId);
}