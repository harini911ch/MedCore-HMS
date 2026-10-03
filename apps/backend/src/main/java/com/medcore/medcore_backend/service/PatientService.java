package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.PatientRequest;
import com.medcore.medcore_backend.dto.PatientResponse;
import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.entity.Patient;
import com.medcore.medcore_backend.entity.Role;
import com.medcore.medcore_backend.entity.User;
import com.medcore.medcore_backend.repository.HospitalRepository;
import com.medcore.medcore_backend.repository.PatientRepository;
import com.medcore.medcore_backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    public PatientService(
            PatientRepository patientRepository,
            HospitalRepository hospitalRepository,
            UserRepository userRepository
    ) {
        this.patientRepository = patientRepository;
        this.hospitalRepository = hospitalRepository;
        this.userRepository = userRepository;
    }

    public PatientResponse createPatient(
            PatientRequest request
    ) {

        Hospital hospital = hospitalRepository
                .findById(request.getHospitalId())
                .orElseThrow(() ->
                        new RuntimeException("Hospital not found")
                );

        if (patientRepository
                .existsByHospitalIdAndPatientNumber(
                        request.getHospitalId(),
                        request.getPatientNumber()
                )) {

            throw new RuntimeException(
                    "Patient number already exists in this hospital"
            );
        }

        User user = null;

        if (request.getUserId() != null) {

            user = userRepository
                    .findById(request.getUserId())
                    .orElseThrow(() ->
                            new RuntimeException("User not found")
                    );

            if (user.getRole() != Role.PATIENT) {
                throw new RuntimeException(
                        "User must have PATIENT role"
                );
            }
        }

        Patient patient = new Patient();

        patient.setHospital(hospital);
        patient.setUser(user);
        patient.setPatientNumber(request.getPatientNumber());
        patient.setFullName(request.getFullName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient.setBloodGroup(request.getBloodGroup());

        Patient savedPatient =
                patientRepository.save(patient);

        return new PatientResponse(savedPatient);
    }

    public List<PatientResponse> getPatients(
            UUID hospitalId
    ) {

        if (!hospitalRepository.existsById(hospitalId)) {
            throw new RuntimeException("Hospital not found");
        }

        return patientRepository
                .findByHospitalIdAndDeletedAtIsNull(hospitalId)
                .stream()
                .map(PatientResponse::new)
                .toList();
    }

    public PatientResponse getPatient(
            UUID patientId
    ) {

        Patient patient = patientRepository
                .findByIdAndDeletedAtIsNull(patientId)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found")
                );

        return new PatientResponse(patient);
    }
}