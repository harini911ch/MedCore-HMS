package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.LabOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LabOrderRepository extends JpaRepository<LabOrder, UUID> {

    List<LabOrder> findByPatientIdOrderByOrderedAtDesc(UUID patientId);

    List<LabOrder> findByDoctorIdOrderByOrderedAtDesc(UUID doctorId);

    List<LabOrder> findByHospitalIdOrderByOrderedAtDesc(UUID hospitalId);
}