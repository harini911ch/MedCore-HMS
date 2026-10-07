package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.InvoiceItem;

import java.math.BigDecimal;
import java.util.UUID;

public class InvoiceItemResponse {

    private UUID id;
    private String description;
    private InvoiceItem.Category category;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal total;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public InvoiceItem.Category getCategory() {
        return category;
    }

    public void setCategory(InvoiceItem.Category category) {
        this.category = category;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}