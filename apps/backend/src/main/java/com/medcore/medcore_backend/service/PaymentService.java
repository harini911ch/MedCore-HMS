package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.PaymentRequest;
import com.medcore.medcore_backend.dto.PaymentResponse;
import com.medcore.medcore_backend.entity.Invoice;
import com.medcore.medcore_backend.entity.Payment;
import com.medcore.medcore_backend.repository.InvoiceRepository;
import com.medcore.medcore_backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional
    public PaymentResponse recordPayment(
            UUID invoiceId,
            PaymentRequest request
    ) {

        if (request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException(
                    "Payment amount must be greater than zero"
            );
        }

        if (request.getMethod() == null) {
            throw new RuntimeException("Payment method is required");
        }

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getStatus() == Invoice.Status.DRAFT) {
            throw new RuntimeException(
                    "Invoice must be finalized before payment"
            );
        }

        if (invoice.getStatus() == Invoice.Status.CANCELLED) {
            throw new RuntimeException(
                    "Cannot pay a cancelled invoice"
            );
        }

        if (invoice.getStatus() == Invoice.Status.PAID) {
            throw new RuntimeException(
                    "Invoice is already fully paid"
            );
        }

        /*
         * At this stage we are implementing verified cash payments.
         * Stripe/Razorpay will be connected later through webhooks.
         */
        if (request.getMethod() != Payment.Method.CASH) {
            throw new RuntimeException(
                    "Only CASH payments are currently supported. "
                            + "Stripe and Razorpay require verified gateway webhooks."
            );
        }

        BigDecimal paidAmount = paymentRepository
                .sumAmountByInvoiceIdAndStatus(
                        invoiceId,
                        Payment.Status.SUCCESS
                );

        if (paidAmount == null) {
            paidAmount = BigDecimal.ZERO;
        }

        paidAmount = paidAmount.setScale(2, RoundingMode.HALF_UP);

        BigDecimal requestedAmount = request.getAmount()
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal amountDue = invoice.getTotal()
                .subtract(paidAmount)
                .setScale(2, RoundingMode.HALF_UP);

        if (requestedAmount.compareTo(amountDue) > 0) {
            throw new RuntimeException(
                    "Payment amount exceeds the outstanding invoice amount"
            );
        }

        Payment payment = new Payment();

        payment.setInvoice(invoice);
        payment.setAmount(requestedAmount);
        payment.setMethod(request.getMethod());
        payment.setStatus(Payment.Status.SUCCESS);
        payment.setTransactionReference(
                request.getTransactionReference()
        );
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        BigDecimal newPaidAmount = paidAmount
                .add(requestedAmount)
                .setScale(2, RoundingMode.HALF_UP);

        if (newPaidAmount.compareTo(invoice.getTotal()) == 0) {
            invoice.setStatus(Invoice.Status.PAID);
            invoiceRepository.save(invoice);
        }

        return toResponse(savedPayment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getInvoicePayments(UUID invoiceId) {

        if (!invoiceRepository.existsById(invoiceId)) {
            throw new RuntimeException("Invoice not found");
        }

        return paymentRepository
                .findByInvoiceIdOrderByCreatedAtDesc(invoiceId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private PaymentResponse toResponse(Payment payment) {

        PaymentResponse response = new PaymentResponse();

        response.setId(payment.getId());
        response.setInvoiceId(payment.getInvoice().getId());
        response.setAmount(payment.getAmount());
        response.setMethod(payment.getMethod());
        response.setStatus(payment.getStatus());
        response.setTransactionReference(
                payment.getTransactionReference()
        );
        response.setPaidAt(payment.getPaidAt());
        response.setCreatedAt(payment.getCreatedAt());

        return response;
    }
}