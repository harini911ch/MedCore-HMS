
package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.PharmacyBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PharmacyBatchRepository
        extends JpaRepository<PharmacyBatch, UUID> {

    List<PharmacyBatch>
    findByMedicineHospitalIdOrderByExpiryDateAsc(UUID hospitalId);

    List<PharmacyBatch>
    findByMedicineIdOrderByExpiryDateAsc(UUID medicineId);

    boolean existsByMedicineIdAndBatchNumberIgnoreCase(
            UUID medicineId,
            String batchNumber
    );
}