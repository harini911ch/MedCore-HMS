package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.HospitalRequest;
import com.medcore.medcore_backend.dto.HospitalResponse;
import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.repository.HospitalRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    public HospitalResponse createHospital(HospitalRequest request) {

        if (hospitalRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Hospital with this email already exists");
        }

        Hospital hospital = new Hospital();

        hospital.setName(request.getName());
        hospital.setEmail(request.getEmail());
        hospital.setPhone(request.getPhone());
        hospital.setAddress(request.getAddress());

        Hospital savedHospital = hospitalRepository.save(hospital);

        return new HospitalResponse(savedHospital);
    }

    public List<HospitalResponse> getAllHospitals() {

        return hospitalRepository.findAll()
                .stream()
                .map(HospitalResponse::new)
                .toList();
    }

    public HospitalResponse getHospitalById(UUID id) {

        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        return new HospitalResponse(hospital);
    }
}