
package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.PharmacyBatchRequest;
import com.medcore.medcore_backend.dto.PharmacyBatchResponse;
import com.medcore.medcore_backend.dto.PharmacyDispenseRequest;
import com.medcore.medcore_backend.dto.PharmacyDispenseResponse;
import com.medcore.medcore_backend.dto.PharmacyPrescriptionDispenseRequest;
import com.medcore.medcore_backend.entity.Medicine;
import com.medcore.medcore_backend.entity.PharmacyBatch;
import com.medcore.medcore_backend.entity.PharmacyDispense;
import com.medcore.medcore_backend.entity.PrescriptionItem;
import com.medcore.medcore_backend.repository.MedicineRepository;
import com.medcore.medcore_backend.repository.PharmacyBatchRepository;
import com.medcore.medcore_backend.repository.PharmacyDispenseRepository;
import com.medcore.medcore_backend.repository.PrescriptionItemRepository;
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
    private final PrescriptionItemRepository prescriptionItemRepository;

    public PharmacyBatchService(
            PharmacyBatchRepository pharmacyBatchRepository,
            MedicineRepository medicineRepository,
            PharmacyDispenseRepository pharmacyDispenseRepository,
            PrescriptionItemRepository prescriptionItemRepository
    ) {
        this.pharmacyBatchRepository = pharmacyBatchRepository;
        this.medicineRepository = medicineRepository;
        this.pharmacyDispenseRepository = pharmacyDispenseRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
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

    /*
     * Existing general dispensing endpoint.
     * Retained for backward compatibility.
     */
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

        validateBatchForDispensing(batch);

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
        pharmacyBatchRepository.save(batch);

        PharmacyDispense dispense = new PharmacyDispense();
        dispense.setBatch(batch);
        dispense.setQuantityDispensed(requested);
        dispense.setRemainingQuantity(remaining);

        PharmacyDispense savedDispense =
                pharmacyDispenseRepository.save(dispense);

        return new PharmacyDispenseResponse(savedDispense);
    }

    /*
     * New prescription-linked dispensing endpoint.
     * The prescription item is locked first so simultaneous requests
     * cannot exceed its prescribed quantity.
     */
    @Transactional
    public PharmacyDispenseResponse dispenseAgainstPrescription(
            UUID batchId,
            PharmacyPrescriptionDispenseRequest request
    ) {
        if (batchId == null) {
            throw new RuntimeException("Batch ID is required");
        }

        if (request == null || request.getPrescriptionItemId() == null) {
            throw new RuntimeException(
                    "Prescription item ID is required"
            );
        }

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException(
                    "Dispensing quantity must be greater than zero"
            );
        }

        PrescriptionItem item = prescriptionItemRepository
                .findByIdForUpdate(request.getPrescriptionItemId())
                .orElseThrow(() ->
                        new RuntimeException("Prescription item not found"));

        if (item.getPrescription() == null) {
            throw new RuntimeException(
                    "Prescription item is not linked to a prescription"
            );
        }

        if (!item.getPrescription().isSigned()) {
            throw new RuntimeException(
                    "Medicine can only be dispensed from a signed prescription"
            );
        }

        if (item.getMedicine() == null) {
            throw new RuntimeException(
                    "No medicine is linked to this prescription item"
            );
        }

        Integer prescribedQuantity = item.getQuantity();

        if (prescribedQuantity == null || prescribedQuantity <= 0) {
            throw new RuntimeException(
                    "Prescription item has an invalid prescribed quantity"
            );
        }

        int previouslyDispensed = item.getQuantityDispensed();
        int requested = request.getQuantity();

        if (previouslyDispensed + requested > prescribedQuantity) {
            throw new RuntimeException(
                    "Dispensing exceeds the prescribed quantity. Prescribed: "
                            + prescribedQuantity
                            + ", already dispensed: "
                            + previouslyDispensed
                            + ", requested: "
                            + requested
            );
        }

        PharmacyBatch batch = pharmacyBatchRepository
                .findByIdForUpdate(batchId)
                .orElseThrow(() ->
                        new RuntimeException("Pharmacy batch not found"));

        validateBatchForDispensing(batch);

        Medicine batchMedicine = batch.getMedicine();
        Medicine prescribedMedicine = item.getMedicine();

        if (!batchMedicine.getId().equals(prescribedMedicine.getId())) {
            throw new RuntimeException(
                    "Selected batch does not match the prescribed medicine"
            );
        }

        UUID prescriptionHospitalId =
                item.getPrescription().getHospital().getId();

        UUID batchHospitalId = batchMedicine.getHospital().getId();

        if (!prescriptionHospitalId.equals(batchHospitalId)) {
            throw new RuntimeException(
                    "Prescription and medicine batch belong to different hospitals"
            );
        }

        int available = batch.getQuantityAvailable();

        if (available < requested) {
            throw new RuntimeException(
                    "Insufficient stock. Available: "
                            + available
                            + ", requested: "
                            + requested
            );
        }

        int remaining = available - requested;

        // Update inventory.
        batch.setQuantityAvailable(remaining);
        pharmacyBatchRepository.save(batch);

        // Record the dispense against the exact prescription item.
        PharmacyDispense dispense = new PharmacyDispense();
        dispense.setBatch(batch);
        dispense.setPrescriptionItem(item);
        dispense.setQuantityDispensed(requested);
        dispense.setRemainingQuantity(remaining);

        PharmacyDispense savedDispense =
                pharmacyDispenseRepository.save(dispense);

        // Track the total amount dispensed for this prescription item.
        item.setQuantityDispensed(previouslyDispensed + requested);
        prescriptionItemRepository.save(item);

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

    private void validateBatchForDispensing(PharmacyBatch batch) {
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