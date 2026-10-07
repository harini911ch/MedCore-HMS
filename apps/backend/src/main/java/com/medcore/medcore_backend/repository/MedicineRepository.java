package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicineRepository
        extends JpaRepository<Medicine, UUID> {

    List<Medicine> findByHospitalIdAndActiveTrueOrderByNameAsc(
            UUID hospitalId
    );

    List<Medicine> findByHospitalIdAndNameContainingIgnoreCaseAndActiveTrueOrderByNameAsc(
            UUID hospitalId,
            String name
    );

    boolean existsByHospitalIdAndNameAndStrength(
            UUID hospitalId,
            String name,
            String strength
    );
}