package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.DoctorAvailabilityRequest;
import com.medcore.medcore_backend.dto.DoctorAvailabilityResponse;
import com.medcore.medcore_backend.entity.Doctor;
import com.medcore.medcore_backend.entity.DoctorAvailability;
import com.medcore.medcore_backend.repository.DoctorAvailabilityRepository;
import com.medcore.medcore_backend.repository.DoctorRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;

    public DoctorAvailabilityService(
            DoctorAvailabilityRepository availabilityRepository,
            DoctorRepository doctorRepository
    ) {
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
    }

    public DoctorAvailabilityResponse createAvailability(
            UUID doctorId,
            DoctorAvailabilityRequest request
    ) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found")
                );

        if (availabilityRepository.existsByDoctorIdAndDayOfWeek(
                doctorId,
                request.getDayOfWeek()
        )) {
            throw new RuntimeException(
                    "Availability already exists for this day"
            );
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new RuntimeException(
                    "Start time must be before end time"
            );
        }

        DoctorAvailability availability =
                new DoctorAvailability();

        availability.setDoctor(doctor);
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setAvailable(request.isAvailable());

        DoctorAvailability savedAvailability =
                availabilityRepository.save(availability);

        return new DoctorAvailabilityResponse(savedAvailability);
    }

    public List<DoctorAvailabilityResponse> getDoctorAvailability(
            UUID doctorId
    ) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Doctor not found");
        }

        return availabilityRepository
                .findByDoctorId(doctorId)
                .stream()
                .map(DoctorAvailabilityResponse::new)
                .toList();
    }
}