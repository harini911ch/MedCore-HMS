package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.entity.MedicalRecord;
import com.medcore.medcore_backend.entity.Patient;
import com.medcore.medcore_backend.entity.Role;
import com.medcore.medcore_backend.entity.User;
import com.medcore.medcore_backend.repository.AppointmentRepository;
import com.medcore.medcore_backend.repository.DoctorRepository;
import com.medcore.medcore_backend.repository.HospitalRepository;
import com.medcore.medcore_backend.repository.MedicalRecordRepository;
import com.medcore.medcore_backend.repository.PatientRepository;
import com.medcore.medcore_backend.repository.UserRepository;
import com.medcore.medcore_backend.repository.VitalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class MedicalRecordServiceAuthorizationTests {

    private MedicalRecordRepository medicalRecordRepository;
    private VitalRepository vitalRepository;
    private HospitalRepository hospitalRepository;
    private PatientRepository patientRepository;
    private DoctorRepository doctorRepository;
    private AppointmentRepository appointmentRepository;
    private UserRepository userRepository;

    private MedicalRecordService service;

    @BeforeEach
    void setUp() {
        medicalRecordRepository = mock(MedicalRecordRepository.class);
        vitalRepository = mock(VitalRepository.class);
        hospitalRepository = mock(HospitalRepository.class);
        patientRepository = mock(PatientRepository.class);
        doctorRepository = mock(DoctorRepository.class);
        appointmentRepository = mock(AppointmentRepository.class);
        userRepository = mock(UserRepository.class);

        service = new MedicalRecordService(
                medicalRecordRepository,
                vitalRepository,
                hospitalRepository,
                patientRepository,
                doctorRepository,
                appointmentRepository,
                userRepository
        );
    }

    @Test
    void hospitalAdminCannotAccessAnotherHospitalsRecords() {
        UUID assignedHospitalId = UUID.randomUUID();
        UUID otherHospitalId = UUID.randomUUID();

        Hospital hospital = new Hospital();
        hospital.setId(assignedHospitalId);

        User admin = new User();
        admin.setEmail("admin@test.example");
        admin.setRole(Role.HOSPITAL_ADMIN);
        admin.setHospital(hospital);

        when(userRepository.findByEmail("admin@test.example"))
                .thenReturn(Optional.of(admin));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.getHospitalRecords(
                        otherHospitalId,
                        "admin@test.example"
                )
        );

        assertEquals(403, exception.getStatusCode().value());

        verify(medicalRecordRepository, never())
                .findByHospitalIdOrderByCreatedAtDesc(any(UUID.class));
    }

    @Test
    void hospitalAdminCanRequestTheirOwnHospitalsRecords() {
        UUID hospitalId = UUID.randomUUID();

        Hospital hospital = new Hospital();
        hospital.setId(hospitalId);

        User admin = new User();
        admin.setEmail("admin@test.example");
        admin.setRole(Role.HOSPITAL_ADMIN);
        admin.setHospital(hospital);

        when(userRepository.findByEmail("admin@test.example"))
                .thenReturn(Optional.of(admin));

        when(medicalRecordRepository.findByHospitalIdOrderByCreatedAtDesc(
                hospitalId
        )).thenReturn(List.of());

        List<?> records = service.getHospitalRecords(
                hospitalId,
                "admin@test.example"
        );

        assertEquals(0, records.size());

        verify(medicalRecordRepository)
                .findByHospitalIdOrderByCreatedAtDesc(hospitalId);
    }

    @Test
    void patientCannotReadAnotherPatientsMedicalRecord() {
        UUID currentUserId = UUID.randomUUID();
        UUID otherPatientId = UUID.randomUUID();
        UUID recordId = UUID.randomUUID();

        User currentUser = new User();
        currentUser.setId(currentUserId);
        currentUser.setEmail("patient@test.example");
        currentUser.setRole(Role.PATIENT);

        Patient otherPatient = new Patient();
        otherPatient.setId(otherPatientId);
        otherPatient.setUser(new User());

        MedicalRecord record = mock(MedicalRecord.class);
        when(record.getPatient()).thenReturn(otherPatient);

        when(userRepository.findByEmail("patient@test.example"))
                .thenReturn(Optional.of(currentUser));
        when(medicalRecordRepository.findById(recordId))
                .thenReturn(Optional.of(record));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.getMedicalRecord(
                        recordId,
                        "patient@test.example"
                )
        );

        assertEquals(403, exception.getStatusCode().value());

        verify(vitalRepository, never()).findByMedicalRecordId(any(UUID.class));
    }
}