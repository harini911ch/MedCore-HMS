package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface DoctorRepository
        extends JpaRepository<Doctor, UUID> {

    List<Doctor> findByHospitalId(UUID hospitalId);

    List<Doctor> findByDepartmentId(UUID departmentId);

    boolean existsByHospitalIdAndLicenseNumber(
            UUID hospitalId,
            String licenseNumber
    );
Optional<Doctor> findByUserId(UUID userId);
}