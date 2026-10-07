package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LabTestRepository extends JpaRepository<LabTest, UUID> {

    List<LabTest> findByHospitalIdAndActiveTrueOrderByNameAsc(UUID hospitalId);

    boolean existsByHospitalIdAndNameIgnoreCase(
            UUID hospitalId,
            String name
    );
}