package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.InvoiceItemRequest;
import com.medcore.medcore_backend.dto.InvoiceItemResponse;
import com.medcore.medcore_backend.dto.InvoiceRequest;
import com.medcore.medcore_backend.dto.InvoiceResponse;
import com.medcore.medcore_backend.entity.Appointment;
import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.entity.Invoice;
import com.medcore.medcore_backend.entity.InvoiceItem;
import com.medcore.medcore_backend.entity.Patient;
import com.medcore.medcore_backend.repository.AppointmentRepository;
import com.medcore.medcore_backend.repository.HospitalRepository;
import com.medcore.medcore_backend.repository.InvoiceRepository;
import com.medcore.medcore_backend.repository.PatientRepository;
import com.medcore.medcore_backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            HospitalRepository hospitalRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            PaymentRepository paymentRepository
    ) {
        this.invoiceRepository = invoiceRepository;
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {

        if (request.getHospitalId() == null) {
            throw new RuntimeException("Hospital ID is required");
        }

        if (request.getPatientId() == null) {
            throw new RuntimeException("Patient ID is required");
        }

        if (request.getAppointmentId() == null) {
            throw new RuntimeException("Appointment ID is required");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Invoice must contain at least one item");
        }

        if (invoiceRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new RuntimeException(
                    "An invoice already exists for this appointment"
            );
        }

        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        BigDecimal taxRate = request.getTaxRate() == null
                ? BigDecimal.ZERO
                : request.getTaxRate();

        if (taxRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Tax rate cannot be negative");
        }

        if (taxRate.compareTo(new BigDecimal("100")) > 0) {
            throw new RuntimeException("Tax rate cannot exceed 100%");
        }

        Invoice invoice = new Invoice();

        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setHospital(hospital);
        invoice.setPatient(patient);
        invoice.setAppointment(appointment);
        invoice.setTaxRate(taxRate.setScale(2, RoundingMode.HALF_UP));
        invoice.setStatus(Invoice.Status.DRAFT);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (InvoiceItemRequest itemRequest : request.getItems()) {

            validateItem(itemRequest);

            BigDecimal itemTotal = itemRequest.getUnitPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            InvoiceItem item = new InvoiceItem();

            item.setDescription(itemRequest.getDescription().trim());
            item.setCategory(itemRequest.getCategory());
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(
                    itemRequest.getUnitPrice()
                            .setScale(2, RoundingMode.HALF_UP)
            );
            item.setTotal(itemTotal);

            invoice.addItem(item);

            subtotal = subtotal.add(itemTotal);
        }

        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);

        BigDecimal taxAmount = subtotal
                .multiply(taxRate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        BigDecimal total = subtotal
                .add(taxAmount)
                .setScale(2, RoundingMode.HALF_UP);

        invoice.setSubtotal(subtotal);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotal(total);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        return toResponse(savedInvoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(UUID invoiceId) {

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getPatientInvoices(UUID patientId) {

        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found");
        }

        return invoiceRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getHospitalInvoices(UUID hospitalId) {

        if (!hospitalRepository.existsById(hospitalId)) {
            throw new RuntimeException("Hospital not found");
        }

        return invoiceRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public InvoiceResponse finalizeInvoice(UUID invoiceId) {

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getStatus() != Invoice.Status.DRAFT) {
            throw new RuntimeException(
                    "Only draft invoices can be finalized"
            );
        }

        if (invoice.getItems().isEmpty()) {
            throw new RuntimeException(
                    "Cannot finalize an invoice without items"
            );
        }

        invoice.setStatus(Invoice.Status.FINALIZED);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        return toResponse(savedInvoice);
    }

    private void validateItem(InvoiceItemRequest item) {

        if (item.getDescription() == null ||
                item.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Item description is required");
        }

        if (item.getCategory() == null) {
            throw new RuntimeException("Item category is required");
        }

        if (item.getQuantity() == null || item.getQuantity() <= 0) {
            throw new RuntimeException(
                    "Item quantity must be greater than zero"
            );
        }

        if (item.getUnitPrice() == null ||
                item.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException(
                    "Item unit price cannot be negative"
            );
        }
    }

    private String generateInvoiceNumber() {

        String date = LocalDate.now().toString().replace("-", "");

        String randomPart = UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();

        return "INV-" + date + "-" + randomPart;
    }

    private InvoiceResponse toResponse(Invoice invoice) {

        BigDecimal amountPaid = paymentRepository
                .sumAmountByInvoiceIdAndStatus(
                        invoice.getId(),
                        com.medcore.medcore_backend.entity.Payment.Status.SUCCESS
                );

        if (amountPaid == null) {
            amountPaid = BigDecimal.ZERO;
        }

        amountPaid = amountPaid.setScale(2, RoundingMode.HALF_UP);

        BigDecimal amountDue = invoice.getTotal()
                .subtract(amountPaid)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        InvoiceResponse response = new InvoiceResponse();

        response.setId(invoice.getId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setHospitalId(invoice.getHospital().getId());
        response.setPatientId(invoice.getPatient().getId());
        response.setAppointmentId(invoice.getAppointment().getId());
        response.setSubtotal(invoice.getSubtotal());
        response.setTaxRate(invoice.getTaxRate());
        response.setTaxAmount(invoice.getTaxAmount());
        response.setTotal(invoice.getTotal());
        response.setAmountPaid(amountPaid);
        response.setAmountDue(amountDue);
        response.setStatus(invoice.getStatus());
        response.setCreatedAt(invoice.getCreatedAt());
        response.setUpdatedAt(invoice.getUpdatedAt());

        List<InvoiceItemResponse> itemResponses = invoice.getItems()
                .stream()
                .map(this::toItemResponse)
                .toList();

        response.setItems(itemResponses);

        return response;
    }

    private InvoiceItemResponse toItemResponse(InvoiceItem item) {

        InvoiceItemResponse response = new InvoiceItemResponse();

        response.setId(item.getId());
        response.setDescription(item.getDescription());
        response.setCategory(item.getCategory());
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setTotal(item.getTotal());

        return response;
    }
}