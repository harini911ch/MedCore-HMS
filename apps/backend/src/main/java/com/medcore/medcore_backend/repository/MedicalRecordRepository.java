package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicalRecordRepository
        extends JpaRepository<MedicalRecord, UUID> {

    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    List<MedicalRecord> findByDoctorIdOrderByCreatedAtDesc(UUID doctorId);

    List<MedicalRecord> findByHospitalIdOrderByCreatedAtDesc(UUID hospitalId);
}