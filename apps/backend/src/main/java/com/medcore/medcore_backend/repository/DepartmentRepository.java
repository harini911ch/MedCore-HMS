package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DepartmentRepository
        extends JpaRepository<Department, UUID> {

    List<Department> findByHospitalId(UUID hospitalId);

    boolean existsByHospitalIdAndName(
            UUID hospitalId,
            String name
    );
}