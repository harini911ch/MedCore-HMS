package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.AppointmentRequest;
import com.medcore.medcore_backend.dto.AppointmentResponse;
import com.medcore.medcore_backend.entity.Appointment;
import com.medcore.medcore_backend.entity.AppointmentStatus;
import com.medcore.medcore_backend.entity.Doctor;
import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.entity.Patient;
import com.medcore.medcore_backend.repository.AppointmentRepository;
import com.medcore.medcore_backend.repository.DoctorRepository;
import com.medcore.medcore_backend.repository.HospitalRepository;
import com.medcore.medcore_backend.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            HospitalRepository hospitalRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.hospitalRepository = hospitalRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {

        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new RuntimeException("Start time and end time are required");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Patient patient = patientRepository.findByIdAndDeletedAtIsNull(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (!doctor.getHospital().getId().equals(hospital.getId())) {
            throw new RuntimeException("Doctor does not belong to this hospital");
        }

        if (!patient.getHospital().getId().equals(hospital.getId())) {
            throw new RuntimeException("Patient does not belong to this hospital");
        }

        if (!request.isEmergency()) {

            List<AppointmentStatus> excludedStatuses = List.of(
                    AppointmentStatus.CANCELLED,
                    AppointmentStatus.NO_SHOW
            );

            boolean overlapping = appointmentRepository.existsOverlappingAppointment(
                    doctor.getId(),
                    request.getAppointmentDate(),
                    request.getStartTime(),
                    request.getEndTime(),
                    excludedStatuses
            );

            if (overlapping) {
                throw new RuntimeException(
                        "Doctor already has an appointment during this time"
                );
            }
        }

        Appointment appointment = new Appointment();

        appointment.setHospital(hospital);
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);

        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());

        appointment.setReason(request.getReason());
        appointment.setEmergency(request.isEmergency());

        appointment.setStatus(AppointmentStatus.PENDING);

        return AppointmentResponse.fromEntity(
                appointmentRepository.save(appointment)
        );
    }

    public List<AppointmentResponse> getHospitalAppointments(UUID hospitalId) {

        return appointmentRepository
                .findByHospitalIdAndDeletedAtIsNull(hospitalId)
                .stream()
                .map(AppointmentResponse::fromEntity)
                .toList();
    }

    public List<AppointmentResponse> getDoctorAppointments(
            UUID doctorId,
            LocalDate appointmentDate
    ) {

        return appointmentRepository
                .findByDoctorIdAndAppointmentDateAndDeletedAtIsNull(
                        doctorId,
                        appointmentDate
                )
                .stream()
                .map(AppointmentResponse::fromEntity)
                .toList();
    }

    public List<AppointmentResponse> getPatientAppointments(UUID patientId) {

        return appointmentRepository
                .findByPatientIdAndDeletedAtIsNull(patientId)
                .stream()
                .map(AppointmentResponse::fromEntity)
                .toList();
    }

    @Transactional
    public AppointmentResponse updateStatus(
            UUID appointmentId,
            AppointmentStatus status
    ) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getDeletedAt() != null) {
            throw new RuntimeException("Appointment has been deleted");
        }

        appointment.setStatus(status);

        return AppointmentResponse.fromEntity(
                appointmentRepository.save(appointment)
        );
    }

    @Transactional
    public void softDelete(UUID appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setDeletedAt(LocalDateTime.now());

        appointmentRepository.save(appointment);
    }
}