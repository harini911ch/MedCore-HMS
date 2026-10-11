
package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.PrescriptionItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrescriptionItemRepository
        extends JpaRepository<PrescriptionItem, UUID> {

    List<PrescriptionItem> findByPrescriptionId(UUID prescriptionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT pi
        FROM PrescriptionItem pi
        WHERE pi.id = :itemId
    """)
    Optional<PrescriptionItem> findByIdForUpdate(
            @Param("itemId") UUID itemId
    );
}