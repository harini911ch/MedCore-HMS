package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.MedicalRecordRequest;
import com.medcore.medcore_backend.dto.MedicalRecordResponse;
import com.medcore.medcore_backend.entity.Appointment;
import com.medcore.medcore_backend.entity.Doctor;
import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.entity.MedicalRecord;
import com.medcore.medcore_backend.entity.Patient;
import com.medcore.medcore_backend.entity.Role;
import com.medcore.medcore_backend.entity.User;
import com.medcore.medcore_backend.entity.Vital;
import com.medcore.medcore_backend.repository.AppointmentRepository;
import com.medcore.medcore_backend.repository.DoctorRepository;
import com.medcore.medcore_backend.repository.HospitalRepository;
import com.medcore.medcore_backend.repository.MedicalRecordRepository;
import com.medcore.medcore_backend.repository.PatientRepository;
import com.medcore.medcore_backend.repository.UserRepository;
import com.medcore.medcore_backend.repository.VitalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final VitalRepository vitalRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public MedicalRecordService(
            MedicalRecordRepository medicalRecordRepository,
            VitalRepository vitalRepository,
            HospitalRepository hospitalRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository
    ) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.vitalRepository = vitalRepository;
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated user not found"
                ));
    }

    private void forbid() {
        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "You are not authorized to access this medical record"
        );
    }

    private UUID hospitalIdOf(User user) {
        return user.getHospital() == null ? null : user.getHospital().getId();
    }

    private boolean sameId(UUID first, UUID second) {
        return first != null && first.equals(second);
    }

    private boolean ownsPatient(User user, Patient patient) {
        return patient.getUser() != null
                && sameId(patient.getUser().getId(), user.getId());
    }

    private boolean ownsDoctor(User user, Doctor doctor) {
        return doctor != null
                && doctor.getUser() != null
                && sameId(doctor.getUser().getId(), user.getId());
    }

    private boolean sameHospital(User user, Hospital hospital) {
        return hospital != null
                && sameId(hospitalIdOf(user), hospital.getId());
    }

    private void authorizeRecordRead(User user, MedicalRecord record) {
        if (user.getRole() == Role.PATIENT) {
            if (ownsPatient(user, record.getPatient())) {
                return;
            }
            forbid();
        }

        if (user.getRole() == Role.DOCTOR) {
            if (ownsDoctor(user, record.getDoctor())) {
                return;
            }
            forbid();
        }

        if (user.getRole() == Role.HOSPITAL_ADMIN) {
            if (sameHospital(user, record.getHospital())) {
                return;
            }
            forbid();
        }

        forbid();
    }

    private MedicalRecordResponse toResponse(MedicalRecord record) {
        Vital vital = vitalRepository
                .findByMedicalRecordId(record.getId())
                .orElse(null);

        return MedicalRecordResponse.fromEntity(record, vital);
    }

    @Transactional
    public MedicalRecordResponse createMedicalRecord(
            MedicalRecordRequest request,
            String authenticatedEmail
    ) {
        User user = requireUser(authenticatedEmail);

        if (user.getRole() != Role.DOCTOR) {
            forbid();
        }

        Doctor authenticatedDoctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "No doctor profile is linked to this account"
                ));

        if (request.getHospitalId() == null
                || !sameId(request.getHospitalId(), authenticatedDoctor.getHospital().getId())) {
            forbid();
        }

        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Hospital not found"
                ));

        if (request.getPatientId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Patient ID is required"
            );
        }

        Patient patient = patientRepository
                .findByIdAndDeletedAtIsNull(request.getPatientId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Patient not found"
                ));

        if (!sameId(patient.getHospital().getId(), hospital.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Patient does not belong to this hospital"
            );
        }

        // Use the authenticated doctor's profile, never a client-supplied doctor ID.
        Doctor doctor = authenticatedDoctor;

        Appointment appointment = null;

        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Appointment not found"
                    ));

            if (!sameId(appointment.getPatient().getId(), patient.getId())
                    || !sameId(appointment.getDoctor().getId(), doctor.getId())
                    || !sameId(appointment.getHospital().getId(), hospital.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Appointment must belong to this patient, doctor, and hospital"
                );
            }
        }

        MedicalRecord record = new MedicalRecord();
        record.setHospital(hospital);
        record.setPatient(patient);
        record.setDoctor(doctor);
        record.setAppointment(appointment);
        record.setChiefComplaints(request.getChiefComplaints());
        record.setSymptoms(request.getSymptoms());
        record.setDiagnoses(request.getDiagnoses());
        record.setTreatmentPlan(request.getTreatmentPlan());
        record.setAllergies(request.getAllergies());
        record.setVaccinationHistory(request.getVaccinationHistory());
        record.setFamilyHistory(request.getFamilyHistory());

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        boolean hasVitals =
                request.getTemperature() != null
                || request.getHeartRate() != null
                || request.getSystolicBp() != null
                || request.getDiastolicBp() != null
                || request.getRespiratoryRate() != null
                || request.getOxygenSaturation() != null
                || request.getWeight() != null
                || request.getHeight() != null;

        if (hasVitals) {
            Vital vital = new Vital();
            vital.setMedicalRecord(savedRecord);
            vital.setTemperature(request.getTemperature());
            vital.setHeartRate(request.getHeartRate());
            vital.setSystolicBp(request.getSystolicBp());
            vital.setDiastolicBp(request.getDiastolicBp());
            vital.setRespiratoryRate(request.getRespiratoryRate());
            vital.setOxygenSaturation(request.getOxygenSaturation());
            vital.setWeight(request.getWeight());
            vital.setHeight(request.getHeight());
            vitalRepository.save(vital);
        }

        return toResponse(savedRecord);
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getMedicalRecord(
            UUID recordId,
            String authenticatedEmail
    ) {
        User user = requireUser(authenticatedEmail);

        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Medical record not found"
                ));

        authorizeRecordRead(user, record);
        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getPatientRecords(
            UUID patientId,
            String authenticatedEmail
    ) {
        User user = requireUser(authenticatedEmail);

        Patient patient = patientRepository.findByIdAndDeletedAtIsNull(patientId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Patient not found"
                ));

        if (user.getRole() == Role.PATIENT) {
            if (!ownsPatient(user, patient)) {
                forbid();
            }
        } else if (user.getRole() == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.FORBIDDEN, "No doctor profile is linked to this account"
                    ));

            if (!sameId(doctor.getHospital().getId(), patient.getHospital().getId())) {
                forbid();
            }
        } else if (user.getRole() == Role.HOSPITAL_ADMIN) {
            if (!sameId(hospitalIdOf(user), patient.getHospital().getId())) {
                forbid();
            }
        } else {
            forbid();
        }

        List<MedicalRecord> records =
                medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);

        if (user.getRole() == Role.DOCTOR) {
            UUID doctorId = doctorRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.FORBIDDEN, "No doctor profile is linked to this account"
                    )).getId();

            records = records.stream()
                    .filter(record -> sameId(record.getDoctor().getId(), doctorId))
                    .toList();
        }

        return records.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getDoctorRecords(
            UUID doctorId,
            String authenticatedEmail
    ) {
        User user = requireUser(authenticatedEmail);

        Doctor requestedDoctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor not found"
                ));

        if (user.getRole() == Role.DOCTOR) {
            if (!ownsDoctor(user, requestedDoctor)) {
                forbid();
            }
        } else if (user.getRole() == Role.HOSPITAL_ADMIN) {
            if (!sameHospital(user, requestedDoctor.getHospital())) {
                forbid();
            }
        } else {
            forbid();
        }

        return medicalRecordRepository
                .findByDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getHospitalRecords(
            UUID hospitalId,
            String authenticatedEmail
    ) {
        User user = requireUser(authenticatedEmail);

        if (user.getRole() != Role.HOSPITAL_ADMIN
                || !sameId(hospitalIdOf(user), hospitalId)) {
            forbid();
        }

        return medicalRecordRepository
                .findByHospitalIdOrderByCreatedAtDesc(hospitalId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
}