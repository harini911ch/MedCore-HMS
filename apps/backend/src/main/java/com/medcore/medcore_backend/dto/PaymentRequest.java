package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.Payment;

import java.math.BigDecimal;

public class PaymentRequest {

    private BigDecimal amount;
    private Payment.Method method;
    private String transactionReference;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Payment.Method getMethod() {
        return method;
    }

    public void setMethod(Payment.Method method) {
        this.method = method;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }
}