package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.LabOrderItemRequest;
import com.medcore.medcore_backend.dto.LabOrderRequest;
import com.medcore.medcore_backend.dto.LabOrderResponse;
import com.medcore.medcore_backend.entity.LabOrder;
import com.medcore.medcore_backend.entity.LabTest;
import com.medcore.medcore_backend.repository.LabOrderRepository;
import com.medcore.medcore_backend.repository.LabTestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class LabOrderService {

    private final LabOrderRepository labOrderRepository;
    private final LabTestRepository labTestRepository;

    public LabOrderService(
            LabOrderRepository labOrderRepository,
            LabTestRepository labTestRepository
    ) {
        this.labOrderRepository = labOrderRepository;
        this.labTestRepository = labTestRepository;
    }

    @Transactional
    public LabOrderResponse createOrder(LabOrderRequest request) {

        if (request.getHospitalId() == null) {
            throw new RuntimeException("Hospital ID is required");
        }

        if (request.getPatientId() == null) {
            throw new RuntimeException("Patient ID is required");
        }

        if (request.getDoctorId() == null) {
            throw new RuntimeException("Doctor ID is required");
        }

        if (request.getTests() == null || request.getTests().isEmpty()) {
            throw new RuntimeException(
                    "At least one lab test is required"
            );
        }

        Set<UUID> uniqueTestIds = new HashSet<>();

        for (LabOrderItemRequest item : request.getTests()) {

            if (item == null || item.getLabTestId() == null) {
                throw new RuntimeException("Lab test ID is required");
            }

            if (!uniqueTestIds.add(item.getLabTestId())) {
                throw new RuntimeException(
                        "Duplicate lab test in the same order"
                );
            }

            LabTest test = labTestRepository
                    .findById(item.getLabTestId())
                    .orElseThrow(() ->
                            new RuntimeException("Lab test not found")
                    );

            if (!test.isActive()) {
                throw new RuntimeException(
                        "Cannot order an inactive lab test"
                );
            }

            if (!test.getHospitalId().equals(request.getHospitalId())) {
                throw new RuntimeException(
                        "Lab test does not belong to the selected hospital"
                );
            }
        }

        LabOrder order = new LabOrder();

        order.setHospitalId(request.getHospitalId());
        order.setPatientId(request.getPatientId());
        order.setDoctorId(request.getDoctorId());
        order.setMedicalRecordId(request.getMedicalRecordId());
        order.setClinicalNotes(request.getClinicalNotes());
        order.setStatus(LabOrder.Status.ORDERED);

        return new LabOrderResponse(
                labOrderRepository.save(order)
        );
    }

    @Transactional(readOnly = true)
    public LabOrderResponse getOrder(UUID orderId) {

        return new LabOrderResponse(
                labOrderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException("Lab order not found")
                        )
        );
    }

    @Transactional(readOnly = true)
    public List<LabOrderResponse> getPatientOrders(UUID patientId) {

        return labOrderRepository
                .findByPatientIdOrderByOrderedAtDesc(patientId)
                .stream()
                .map(LabOrderResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LabOrderResponse> getDoctorOrders(UUID doctorId) {

        return labOrderRepository
                .findByDoctorIdOrderByOrderedAtDesc(doctorId)
                .stream()
                .map(LabOrderResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LabOrderResponse> getHospitalOrders(UUID hospitalId) {

        return labOrderRepository
                .findByHospitalIdOrderByOrderedAtDesc(hospitalId)
                .stream()
                .map(LabOrderResponse::new)
                .toList();
    }

    @Transactional
    public LabOrderResponse updateStatus(
            UUID orderId,
            LabOrder.Status newStatus
    ) {

        if (newStatus == null) {
            throw new RuntimeException("New status is required");
        }

        LabOrder order = labOrderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Lab order not found")
                );

        if (order.getStatus() == LabOrder.Status.CANCELLED) {
            throw new RuntimeException(
                    "Cancelled lab order cannot be updated"
            );
        }

        if (newStatus == LabOrder.Status.COMPLETED) {
            order.setCompletedAt(java.time.LocalDateTime.now());
        }

        order.setStatus(newStatus);

        return new LabOrderResponse(
                labOrderRepository.save(order)
        );
    }
}