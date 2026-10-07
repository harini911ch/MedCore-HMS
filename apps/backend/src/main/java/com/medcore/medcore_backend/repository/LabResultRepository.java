package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LabResultRepository extends JpaRepository<LabResult, UUID> {

    List<LabResult> findByLabOrderIdOrderByCreatedAtAsc(UUID labOrderId);

    boolean existsByLabOrderIdAndLabTestId(
            UUID labOrderId,
            UUID labTestId
    );
}