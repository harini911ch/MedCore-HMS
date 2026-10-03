package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DoctorAvailabilityRepository
        extends JpaRepository<DoctorAvailability, UUID> {

    List<DoctorAvailability> findByDoctorId(UUID doctorId);

    boolean existsByDoctorIdAndDayOfWeek(
            UUID doctorId,
            String dayOfWeek
    );
}