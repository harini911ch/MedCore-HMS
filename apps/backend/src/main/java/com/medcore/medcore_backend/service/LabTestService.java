package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.LabTestRequest;
import com.medcore.medcore_backend.dto.LabTestResponse;
import com.medcore.medcore_backend.entity.LabTest;
import com.medcore.medcore_backend.repository.LabTestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class LabTestService {

    private final LabTestRepository labTestRepository;

    public LabTestService(LabTestRepository labTestRepository) {
        this.labTestRepository = labTestRepository;
    }

    @Transactional
    public LabTestResponse createTest(LabTestRequest request) {

        validate(request);

        if (labTestRepository.existsByHospitalIdAndNameIgnoreCase(
                request.getHospitalId(),
                request.getName().trim()
        )) {
            throw new RuntimeException(
                    "Lab test with this name already exists in the hospital"
            );
        }

        LabTest test = new LabTest();

        test.setHospitalId(request.getHospitalId());
        test.setName(request.getName().trim());
        test.setDescription(request.getDescription());
        test.setSampleType(request.getSampleType().trim());
        test.setPrice(request.getPrice());
        test.setActive(
                request.getActive() == null || request.getActive()
        );

        return new LabTestResponse(
                labTestRepository.save(test)
        );
    }

    @Transactional(readOnly = true)
    public List<LabTestResponse> getHospitalTests(UUID hospitalId) {

        return labTestRepository
                .findByHospitalIdAndActiveTrueOrderByNameAsc(hospitalId)
                .stream()
                .map(LabTestResponse::new)
                .toList();
    }

    private void validate(LabTestRequest request) {

        if (request.getHospitalId() == null) {
            throw new RuntimeException("Hospital ID is required");
        }

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Lab test name is required");
        }

        if (request.getSampleType() == null ||
                request.getSampleType().isBlank()) {
            throw new RuntimeException("Sample type is required");
        }

        if (request.getPrice() == null ||
                request.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException(
                    "Lab test price must be zero or greater"
            );
        }
    }
}