package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.LabResultRequest;
import com.medcore.medcore_backend.dto.LabResultResponse;
import com.medcore.medcore_backend.entity.LabOrder;
import com.medcore.medcore_backend.entity.LabResult;
import com.medcore.medcore_backend.entity.LabTest;
import com.medcore.medcore_backend.repository.LabOrderRepository;
import com.medcore.medcore_backend.repository.LabResultRepository;
import com.medcore.medcore_backend.repository.LabTestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LabResultService {

    private final LabResultRepository labResultRepository;
    private final LabOrderRepository labOrderRepository;
    private final LabTestRepository labTestRepository;

    public LabResultService(
            LabResultRepository labResultRepository,
            LabOrderRepository labOrderRepository,
            LabTestRepository labTestRepository
    ) {
        this.labResultRepository = labResultRepository;
        this.labOrderRepository = labOrderRepository;
        this.labTestRepository = labTestRepository;
    }

    @Transactional
    public LabResultResponse createResult(LabResultRequest request) {

        if (request.getLabOrderId() == null) {
            throw new RuntimeException("Lab order ID is required");
        }

        if (request.getLabTestId() == null) {
            throw new RuntimeException("Lab test ID is required");
        }

        if (request.getResultValue() == null ||
                request.getResultValue().isBlank()) {
            throw new RuntimeException("Result value is required");
        }

        LabOrder order = labOrderRepository
                .findById(request.getLabOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Lab order not found")
                );

        LabTest test = labTestRepository
                .findById(request.getLabTestId())
                .orElseThrow(() ->
                        new RuntimeException("Lab test not found")
                );

        if (!test.getHospitalId().equals(order.getHospitalId())) {
            throw new RuntimeException(
                    "Lab test does not belong to the lab order hospital"
            );
        }

        if (labResultRepository.existsByLabOrderIdAndLabTestId(
                request.getLabOrderId(),
                request.getLabTestId()
        )) {
            throw new RuntimeException(
                    "Result already exists for this lab test"
            );
        }

        LabResult result = new LabResult();

        result.setLabOrderId(request.getLabOrderId());
        result.setLabTestId(request.getLabTestId());
        result.setResultValue(request.getResultValue().trim());
        result.setUnit(request.getUnit());
        result.setReferenceRange(request.getReferenceRange());
        result.setRemarks(request.getRemarks());
        result.setStatus(LabResult.Status.READY);
        result.setResultedAt(LocalDateTime.now());

        LabResult saved = labResultRepository.save(result);

        updateOrderCompletion(order);

        return new LabResultResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LabResultResponse> getOrderResults(UUID orderId) {

        return labResultRepository
                .findByLabOrderIdOrderByCreatedAtAsc(orderId)
                .stream()
                .map(LabResultResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public LabResultResponse getResult(UUID resultId) {

        return new LabResultResponse(
                labResultRepository.findById(resultId)
                        .orElseThrow(() ->
                                new RuntimeException("Lab result not found")
                        )
        );
    }

    private void updateOrderCompletion(LabOrder order) {

        List<LabResult> results =
                labResultRepository
                        .findByLabOrderIdOrderByCreatedAtAsc(order.getId());

        if (!results.isEmpty()) {
            order.setStatus(LabOrder.Status.COMPLETED);
            order.setCompletedAt(LocalDateTime.now());
            labOrderRepository.save(order);
        }
    }
}