package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.DoctorRequest;
import com.medcore.medcore_backend.dto.DoctorResponse;
import com.medcore.medcore_backend.entity.Department;
import com.medcore.medcore_backend.entity.Doctor;
import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.entity.User;
import com.medcore.medcore_backend.repository.DepartmentRepository;
import com.medcore.medcore_backend.repository.DoctorRepository;
import com.medcore.medcore_backend.repository.HospitalRepository;
import com.medcore.medcore_backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;

    public DoctorService(
            DoctorRepository doctorRepository,
            UserRepository userRepository,
            HospitalRepository hospitalRepository,
            DepartmentRepository departmentRepository
    ) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.departmentRepository = departmentRepository;
    }

    public DoctorResponse createDoctor(
            DoctorRequest request
    ) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Hospital hospital = hospitalRepository.findById(
                request.getHospitalId()
        ).orElseThrow(() ->
                new RuntimeException("Hospital not found")
        );

        Department department = departmentRepository.findById(
                request.getDepartmentId()
        ).orElseThrow(() ->
                new RuntimeException("Department not found")
        );

        if (doctorRepository.existsByHospitalIdAndLicenseNumber(
                request.getHospitalId(),
                request.getLicenseNumber()
        )) {
            throw new RuntimeException(
                    "Doctor with this license number already exists"
            );
        }

        if (user.getRole() != com.medcore.medcore_backend.entity.Role.DOCTOR) {
            throw new RuntimeException(
                    "User must have DOCTOR role"
            );
        }

        Doctor doctor = new Doctor();

        doctor.setUser(user);
        doctor.setHospital(hospital);
        doctor.setDepartment(department);
        doctor.setSpecialization(request.getSpecialization());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setQualification(request.getQualification());
        doctor.setExperience(request.getExperience());
        doctor.setBio(request.getBio());

        Doctor savedDoctor = doctorRepository.save(doctor);

        return new DoctorResponse(savedDoctor);
    }

    public List<DoctorResponse> getDoctors(
            UUID hospitalId
    ) {
        return doctorRepository
                .findByHospitalId(hospitalId)
                .stream()
                .map(DoctorResponse::new)
                .toList();
    }

    public List<DoctorResponse> getDoctorsByDepartment(
            UUID departmentId
    ) {
        return doctorRepository
                .findByDepartmentId(departmentId)
                .stream()
                .map(DoctorResponse::new)
                .toList();
    }
}