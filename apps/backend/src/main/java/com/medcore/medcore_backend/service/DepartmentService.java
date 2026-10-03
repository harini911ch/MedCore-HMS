package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.DepartmentRequest;
import com.medcore.medcore_backend.dto.DepartmentResponse;
import com.medcore.medcore_backend.entity.Department;
import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.repository.DepartmentRepository;
import com.medcore.medcore_backend.repository.HospitalRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final HospitalRepository hospitalRepository;

    public DepartmentService(
            DepartmentRepository departmentRepository,
            HospitalRepository hospitalRepository
    ) {
        this.departmentRepository = departmentRepository;
        this.hospitalRepository = hospitalRepository;
    }

    public DepartmentResponse createDepartment(
            UUID hospitalId,
            DepartmentRequest request
    ) {

        Hospital hospital = hospitalRepository
                .findById(hospitalId)
                .orElseThrow(() ->
                        new RuntimeException("Hospital not found")
                );

        if (departmentRepository
                .existsByHospitalIdAndName(
                        hospitalId,
                        request.getName()
                )) {

            throw new RuntimeException(
                    "Department already exists in this hospital"
            );
        }

        Department department = new Department();

        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setHospital(hospital);

        Department saved =
                departmentRepository.save(department);

        return new DepartmentResponse(saved);
    }

    public List<DepartmentResponse> getDepartments(
            UUID hospitalId
    ) {

        return departmentRepository
                .findByHospitalId(hospitalId)
                .stream()
                .map(DepartmentResponse::new)
                .toList();
    }
}