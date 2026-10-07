package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    List<Invoice> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    List<Invoice> findByHospitalIdOrderByCreatedAtDesc(UUID hospitalId);

    boolean existsByAppointmentId(UUID appointmentId);
}