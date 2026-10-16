package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.AppointmentRequest;
import com.medcore.medcore_backend.dto.AppointmentResponse;
import com.medcore.medcore_backend.dto.NotificationRequest;
import com.medcore.medcore_backend.entity.Appointment;
import com.medcore.medcore_backend.entity.AppointmentStatus;
import com.medcore.medcore_backend.entity.Doctor;
import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.entity.Patient;
import com.medcore.medcore_backend.entity.Notification;
import com.medcore.medcore_backend.repository.AppointmentRepository;
import com.medcore.medcore_backend.repository.DoctorRepository;
import com.medcore.medcore_backend.repository.HospitalRepository;
import com.medcore.medcore_backend.repository.PatientRepository;
import com.medcore.medcore_backend.service.NotificationService;
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
    private final com.medcore.medcore_backend.repository.UserRepository userRepository;
    private final NotificationService notificationService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            HospitalRepository hospitalRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            com.medcore.medcore_backend.repository.UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.hospitalRepository = hospitalRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
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

        Appointment savedAppointment = appointmentRepository.save(appointment);

        NotificationRequest doctorNotification = new NotificationRequest();
        doctorNotification.setRecipientUserId(doctor.getUser().getId());
        doctorNotification.setType(Notification.Type.APPOINTMENT_CREATED);
        doctorNotification.setTitle("New appointment scheduled");
        doctorNotification.setMessage(
                "Appointment with " + patient.getFullName()
                        + " scheduled for " + savedAppointment.getAppointmentDate()
                        + " at " + savedAppointment.getStartTime() + "."
        );
        doctorNotification.setRelatedEntityType("APPOINTMENT");
        doctorNotification.setRelatedEntityId(savedAppointment.getId());
        notificationService.createNotification(doctorNotification);

        if (patient.getUser() != null) {
            NotificationRequest patientNotification = new NotificationRequest();
            patientNotification.setRecipientUserId(patient.getUser().getId());
            patientNotification.setType(Notification.Type.APPOINTMENT_CREATED);
            patientNotification.setTitle("Appointment scheduled");
            patientNotification.setMessage(
                    "Your appointment is scheduled for "
                            + savedAppointment.getAppointmentDate()
                            + " at " + savedAppointment.getStartTime() + "."
            );
            patientNotification.setRelatedEntityType("APPOINTMENT");
            patientNotification.setRelatedEntityId(savedAppointment.getId());
            notificationService.createNotification(patientNotification);
        }

        return AppointmentResponse.fromEntity(savedAppointment);
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

    public List<AppointmentResponse> getPatientAppointmentsForUser(
            String email,
            UUID requestedPatientId
    ) {
        com.medcore.medcore_backend.entity.User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        if (user.getRole() != com.medcore.medcore_backend.entity.Role.PATIENT) {
            throw new RuntimeException("Only patients can access this endpoint");
        }

        Patient ownPatient = patientRepository
                .findByUser_IdAndDeletedAtIsNull(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Patient profile not found"));

        if (!ownPatient.getId().equals(requestedPatientId)) {
            throw new RuntimeException(
                    "You are not allowed to view these appointments");
        }

        return appointmentRepository
                .findByPatientIdAndDeletedAtIsNull(ownPatient.getId())
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

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return AppointmentResponse.fromEntity(savedAppointment);
    }

    @Transactional
    public void softDelete(UUID appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setDeletedAt(LocalDateTime.now());

        appointmentRepository.save(appointment);
    }
}