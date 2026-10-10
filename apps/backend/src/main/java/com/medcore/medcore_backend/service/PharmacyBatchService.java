
package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.PharmacyBatchRequest;
import com.medcore.medcore_backend.dto.PharmacyBatchResponse;
import com.medcore.medcore_backend.dto.PharmacyDispenseRequest;
import com.medcore.medcore_backend.dto.PharmacyDispenseResponse;
import com.medcore.medcore_backend.entity.Medicine;
import com.medcore.medcore_backend.entity.PharmacyBatch;
import com.medcore.medcore_backend.entity.PharmacyDispense;
import com.medcore.medcore_backend.repository.MedicineRepository;
import com.medcore.medcore_backend.repository.PharmacyBatchRepository;
import com.medcore.medcore_backend.repository.PharmacyDispenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class PharmacyBatchService {

    private final PharmacyBatchRepository pharmacyBatchRepository;
    private final MedicineRepository medicineRepository;
    private final PharmacyDispenseRepository pharmacyDispenseRepository;

    public PharmacyBatchService(
            PharmacyBatchRepository pharmacyBatchRepository,
            MedicineRepository medicineRepository,
            PharmacyDispenseRepository pharmacyDispenseRepository
    ) {
        this.pharmacyBatchRepository = pharmacyBatchRepository;
        this.medicineRepository = medicineRepository;
        this.pharmacyDispenseRepository = pharmacyDispenseRepository;
    }

    @Transactional
    public PharmacyBatchResponse createBatch(
            PharmacyBatchRequest request
    ) {
        if (request == null
                || request.getHospitalId() == null
                || request.getMedicineId() == null) {
            throw new RuntimeException(
                    "Hospital ID and medicine ID are required"
            );
        }

        if (request.getBatchNumber() == null
                || request.getBatchNumber().isBlank()) {
            throw new RuntimeException("Batch number is required");
        }

        if (request.getExpiryDate() == null) {
            throw new RuntimeException("Expiry date is required");
        }

        if (request.getQuantityAvailable() == null
                || request.getQuantityAvailable() <= 0) {
            throw new RuntimeException(
                    "Initial quantity must be greater than zero"
            );
        }

        if (request.getReorderLevel() != null
                && request.getReorderLevel() < 0) {
            throw new RuntimeException(
                    "Reorder level cannot be negative"
            );
        }

        validatePrice(request.getPurchasePrice(), "Purchase price");
        validatePrice(request.getSellingPrice(), "Selling price");

        Medicine medicine = medicineRepository
                .findById(request.getMedicineId())
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));

        if (!medicine.getHospital().getId()
                .equals(request.getHospitalId())) {
            throw new RuntimeException(
                    "Medicine does not belong to the specified hospital"
            );
        }

        if (!medicine.isActive()) {
            throw new RuntimeException(
                    "Cannot add inventory for an inactive medicine"
            );
        }

        String batchNumber = request.getBatchNumber().trim();

        if (pharmacyBatchRepository
                .existsByMedicineIdAndBatchNumberIgnoreCase(
                        medicine.getId(),
                        batchNumber
                )) {
            throw new RuntimeException(
                    "This batch number already exists for the medicine"
            );
        }

        PharmacyBatch batch = new PharmacyBatch();
        batch.setMedicine(medicine);
        batch.setBatchNumber(batchNumber);
        batch.setExpiryDate(request.getExpiryDate());
        batch.setQuantityAvailable(request.getQuantityAvailable());
        batch.setReorderLevel(
                request.getReorderLevel() == null
                        ? 10
                        : request.getReorderLevel()
        );
        batch.setPurchasePrice(request.getPurchasePrice());
        batch.setSellingPrice(request.getSellingPrice());

        return new PharmacyBatchResponse(
                pharmacyBatchRepository.save(batch)
        );
    }

    @Transactional(readOnly = true)
    public List<PharmacyBatchResponse> getBatchesByHospital(
            UUID hospitalId
    ) {
        if (hospitalId == null) {
            throw new RuntimeException("Hospital ID is required");
        }

        return pharmacyBatchRepository
                .findByMedicineHospitalIdOrderByExpiryDateAsc(hospitalId)
                .stream()
                .map(PharmacyBatchResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PharmacyBatchResponse> getBatchesByMedicine(
            UUID medicineId
    ) {
        if (medicineId == null) {
            throw new RuntimeException("Medicine ID is required");
        }

        return pharmacyBatchRepository
                .findByMedicineIdOrderByExpiryDateAsc(medicineId)
                .stream()
                .map(PharmacyBatchResponse::new)
                .toList();
    }

    @Transactional
    public PharmacyDispenseResponse dispenseMedicine(
            UUID batchId,
            PharmacyDispenseRequest request
    ) {
        if (batchId == null) {
            throw new RuntimeException("Batch ID is required");
        }

        if (request == null
                || request.getQuantity() == null
                || request.getQuantity() <= 0) {
            throw new RuntimeException(
                    "Dispensing quantity must be greater than zero"
            );
        }

        PharmacyBatch batch = pharmacyBatchRepository
                .findByIdForUpdate(batchId)
                .orElseThrow(() ->
                        new RuntimeException("Pharmacy batch not found"));

        if (!batch.getMedicine().isActive()) {
            throw new RuntimeException(
                    "Cannot dispense an inactive medicine"
            );
        }

        if (batch.getExpiryDate().isBefore(LocalDate.now())) {
            throw new RuntimeException(
                    "Cannot dispense medicine from an expired batch"
            );
        }

        int available = batch.getQuantityAvailable();
        int requested = request.getQuantity();

        if (available < requested) {
            throw new RuntimeException(
                    "Insufficient stock. Available: "
                            + available
                            + ", requested: "
                            + requested
            );
        }

        int remaining = available - requested;
        batch.setQuantityAvailable(remaining);

        // Save the inventory change and dispensing record atomically.
        pharmacyBatchRepository.save(batch);

        PharmacyDispense dispense = new PharmacyDispense();
        dispense.setBatch(batch);
        dispense.setQuantityDispensed(requested);
        dispense.setRemainingQuantity(remaining);

        PharmacyDispense savedDispense =
                pharmacyDispenseRepository.save(dispense);

        return new PharmacyDispenseResponse(savedDispense);
    }

    @Transactional(readOnly = true)
    public List<PharmacyDispenseResponse> getDispensingHistory(
            UUID hospitalId
    ) {
        if (hospitalId == null) {
            throw new RuntimeException("Hospital ID is required");
        }

        return pharmacyDispenseRepository
                .findByBatchMedicineHospitalIdOrderByDispensedAtDesc(
                        hospitalId
                )
                .stream()
                .map(PharmacyDispenseResponse::new)
                .toList();
    }

    private void validatePrice(
            BigDecimal price,
            String fieldName
    ) {
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException(
                    fieldName + " must be zero or greater"
            );
        }
    }
}

