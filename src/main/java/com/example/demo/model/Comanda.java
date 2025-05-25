package com.example.demo.model;

import java.util.List;

public class Comanda {
    private String emailClient;
    private String numeClient;
    private String orderId;
    private String total;
    private List<ComandaProdus> products;
    private String couponCode;

    public String getEmailClient() {
        return emailClient;
    }
    public Comanda(String orderId, String numeClient, String emailClient, String total, List<ComandaProdus> products) {
        this.orderId = orderId;
        this.numeClient = numeClient;
        this.emailClient = emailClient;
        this.total = total;
        this.products = products;
    }

    public void setEmailClient(String emailClient) {
        this.emailClient = emailClient;
    }

    public String getNumeClient() {
        return numeClient;
    }

    public void setNumeClient(String numeClient) {
        this.numeClient = numeClient;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getTotal() {
        return total;
    }

    public void setTotal(String total) {
        this.total = total;
    }

    public List<ComandaProdus> getProducts() {
        return products;
    }

    public void setProducts(List<ComandaProdus> products) {
        this.products = products;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }
}
