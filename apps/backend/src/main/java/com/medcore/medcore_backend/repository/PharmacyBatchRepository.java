
package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.PharmacyBatch;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT b
            FROM PharmacyBatch b
            WHERE b.id = :batchId
            """)
    Optional<PharmacyBatch> findByIdForUpdate(
            @Param("batchId") UUID batchId
    );
}

