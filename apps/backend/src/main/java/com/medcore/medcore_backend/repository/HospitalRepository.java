package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HospitalRepository extends JpaRepository<Hospital, UUID> {

    Optional<Hospital> findByEmail(String email);

    boolean existsByEmail(String email);
}