package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.MedicineRequest;
import com.medcore.medcore_backend.dto.MedicineResponse;
import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.entity.Medicine;
import com.medcore.medcore_backend.repository.HospitalRepository;
import com.medcore.medcore_backend.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final HospitalRepository hospitalRepository;

    public MedicineService(
            MedicineRepository medicineRepository,
            HospitalRepository hospitalRepository
    ) {
        this.medicineRepository = medicineRepository;
        this.hospitalRepository = hospitalRepository;
    }

    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {

        if (request.getName() == null ||
                request.getName().isBlank()) {
            throw new RuntimeException("Medicine name is required");
        }

        Hospital hospital = hospitalRepository
                .findById(request.getHospitalId())
                .orElseThrow(() ->
                        new RuntimeException("Hospital not found"));

        if (medicineRepository.existsByHospitalIdAndNameAndStrength(
                request.getHospitalId(),
                request.getName(),
                request.getStrength()
        )) {
            throw new RuntimeException(
                    "Medicine already exists in this hospital"
            );
        }

        Medicine medicine = new Medicine();

        medicine.setHospital(hospital);
        medicine.setName(request.getName());
        medicine.setGenericName(request.getGenericName());
        medicine.setDosageForm(request.getDosageForm());
        medicine.setStrength(request.getStrength());
        medicine.setManufacturer(request.getManufacturer());
        medicine.setActive(true);

        return MedicineResponse.fromEntity(
                medicineRepository.save(medicine)
        );
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getMedicines(UUID hospitalId) {

        return medicineRepository
                .findByHospitalIdAndActiveTrueOrderByNameAsc(hospitalId)
                .stream()
                .map(MedicineResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> searchMedicines(
            UUID hospitalId,
            String name
    ) {

        return medicineRepository
                .findByHospitalIdAndNameContainingIgnoreCaseAndActiveTrueOrderByNameAsc(
                        hospitalId,
                        name
                )
                .stream()
                .map(MedicineResponse::fromEntity)
                .toList();
    }
}