
package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.PharmacyDispense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PharmacyDispenseRepository
        extends JpaRepository<PharmacyDispense, UUID> {

    List<PharmacyDispense>
    findByBatchMedicineHospitalIdOrderByDispensedAtDesc(
            UUID hospitalId
    );
}

