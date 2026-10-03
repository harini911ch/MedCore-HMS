package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.Appointment;
import com.medcore.medcore_backend.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    @Query("""
        SELECT COUNT(a) > 0
        FROM Appointment a
        WHERE a.doctor.id = :doctorId
        AND a.appointmentDate = :appointmentDate
        AND a.deletedAt IS NULL
        AND a.status NOT IN :excludedStatuses
        AND a.startTime < :endTime
        AND a.endTime > :startTime
        """)
    boolean existsOverlappingAppointment(
            @Param("doctorId") UUID doctorId,
            @Param("appointmentDate") LocalDate appointmentDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludedStatuses") List<AppointmentStatus> excludedStatuses
    );

    List<Appointment> findByHospitalIdAndDeletedAtIsNull(UUID hospitalId);

    List<Appointment> findByDoctorIdAndAppointmentDateAndDeletedAtIsNull(
            UUID doctorId,
            LocalDate appointmentDate
    );

    List<Appointment> findByPatientIdAndDeletedAtIsNull(UUID patientId);
}