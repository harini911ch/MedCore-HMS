package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.MedicalRecordRequest;
import com.medcore.medcore_backend.dto.MedicalRecordResponse;
import com.medcore.medcore_backend.entity.Appointment;
import com.medcore.medcore_backend.entity.Doctor;
import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.entity.MedicalRecord;
import com.medcore.medcore_backend.entity.Patient;
import com.medcore.medcore_backend.entity.Vital;
import com.medcore.medcore_backend.repository.AppointmentRepository;
import com.medcore.medcore_backend.repository.DoctorRepository;
import com.medcore.medcore_backend.repository.HospitalRepository;
import com.medcore.medcore_backend.repository.MedicalRecordRepository;
import com.medcore.medcore_backend.repository.PatientRepository;
import com.medcore.medcore_backend.repository.VitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public MedicalRecordService(
            MedicalRecordRepository medicalRecordRepository,
            VitalRepository vitalRepository,
            HospitalRepository hospitalRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository
    ) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.vitalRepository = vitalRepository;
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public MedicalRecordResponse createMedicalRecord(
            MedicalRecordRequest request
    ) {
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        Patient patient = patientRepository
                .findByIdAndDeletedAtIsNull(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!patient.getHospital().getId().equals(hospital.getId())) {
            throw new RuntimeException(
                    "Patient does not belong to this hospital"
            );
        }

        if (!doctor.getHospital().getId().equals(hospital.getId())) {
            throw new RuntimeException(
                    "Doctor does not belong to this hospital"
            );
        }

        Appointment appointment = null;

        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(
                    request.getAppointmentId()
            ).orElseThrow(() ->
                    new RuntimeException("Appointment not found")
            );

            if (!appointment.getPatient().getId().equals(patient.getId())) {
                throw new RuntimeException(
                        "Appointment does not belong to this patient"
                );
            }

            if (!appointment.getDoctor().getId().equals(doctor.getId())) {
                throw new RuntimeException(
                        "Appointment does not belong to this doctor"
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

        MedicalRecord savedRecord =
                medicalRecordRepository.save(record);

        boolean hasVitals =
                request.getTemperature() != null
                        || request.getHeartRate() != null
                        || request.getSystolicBp() != null
                        || request.getDiastolicBp() != null
                        || request.getRespiratoryRate() != null
                        || request.getOxygenSaturation() != null
                        || request.getWeight() != null
                        || request.getHeight() != null;

        Vital savedVital = null;

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

            savedVital = vitalRepository.save(vital);
        }

        return MedicalRecordResponse.fromEntity(
                savedRecord,
                savedVital
        );
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getMedicalRecord(UUID recordId) {

        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() ->
                        new RuntimeException("Medical record not found")
                );

        Vital vital = vitalRepository
                .findByMedicalRecordId(recordId)
                .orElse(null);

        return MedicalRecordResponse.fromEntity(record, vital);
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getPatientRecords(
            UUID patientId
    ) {
        return medicalRecordRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(record -> MedicalRecordResponse.fromEntity(
                        record,
                        vitalRepository
                                .findByMedicalRecordId(record.getId())
                                .orElse(null)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getDoctorRecords(
            UUID doctorId
    ) {
        return medicalRecordRepository
                .findByDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(record -> MedicalRecordResponse.fromEntity(
                        record,
                        vitalRepository
                                .findByMedicalRecordId(record.getId())
                                .orElse(null)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getHospitalRecords(
            UUID hospitalId
    ) {
        return medicalRecordRepository
                .findByHospitalIdOrderByCreatedAtDesc(hospitalId)
                .stream()
                .map(record -> MedicalRecordResponse.fromEntity(
                        record,
                        vitalRepository
                                .findByMedicalRecordId(record.getId())
                                .orElse(null)
                ))
                .toList();
    }
}