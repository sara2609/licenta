package com.example.demo.controller;

import com.example.demo.service.InstallmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/installments")
public class InstallmentController {

    private final InstallmentService installmentService;

    public InstallmentController(InstallmentService installmentService) {
        this.installmentService = installmentService;
    }

    @PostMapping("/create")
    public ResponseEntity<String> createInstallment(@RequestBody Map<String, Object> payload) {
        String orderId = (String) payload.get("orderId");
        int months = ((Number) payload.get("months")).intValue();
        BigDecimal total = new BigDecimal(payload.get("total").toString());

        boolean created = installmentService.createInstallmentPlan(orderId, months, total);
        return created
                ? ResponseEntity.ok("✅ Plan de rate creat.")
                : ResponseEntity.badRequest().body("❌ Comanda nu a fost găsită.");
    }
}
