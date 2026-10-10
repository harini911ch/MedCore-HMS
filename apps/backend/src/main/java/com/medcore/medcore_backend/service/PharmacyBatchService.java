
package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.PharmacyBatchRequest;
import com.medcore.medcore_backend.dto.PharmacyBatchResponse;
import com.medcore.medcore_backend.entity.Medicine;
import com.medcore.medcore_backend.entity.PharmacyBatch;
import com.medcore.medcore_backend.repository.MedicineRepository;
import com.medcore.medcore_backend.repository.PharmacyBatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class PharmacyBatchService {

    private final PharmacyBatchRepository pharmacyBatchRepository;
    private final MedicineRepository medicineRepository;

    public PharmacyBatchService(
            PharmacyBatchRepository pharmacyBatchRepository,
            MedicineRepository medicineRepository
    ) {
        this.pharmacyBatchRepository = pharmacyBatchRepository;
        this.medicineRepository = medicineRepository;
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

    private void validatePrice(BigDecimal price, String fieldName) {
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException(
                    fieldName + " must be zero or greater"
            );
        }
    }
}