package com.example.demo.controller;

import com.example.demo.service.PaymentService;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createPayment(@RequestBody Map<String, Object> payload) {
        try {
            long amount = ((Number) payload.get("amount")).longValue();
            Integer months = payload.get("months") != null ? ((Number) payload.get("months")).intValue() : null;

            return ResponseEntity.ok(paymentService.createPaymentIntent(amount, months));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
