package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByInvoiceIdOrderByCreatedAtDesc(UUID invoiceId);

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0)
            FROM Payment p
            WHERE p.invoice.id = :invoiceId
            AND p.status = :status
            """)
    BigDecimal sumAmountByInvoiceIdAndStatus(
            @Param("invoiceId") UUID invoiceId,
            @Param("status") Payment.Status status
    );
}