package com.example.demo.service;

import com.example.demo.model.ComandaEntity;
import com.example.demo.model.InstallmentPlan;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.InstallmentPlanRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class InstallmentService {

    private final InstallmentPlanRepository installmentRepo;
    private final OrderRepository comandaRepo;

    public InstallmentService(InstallmentPlanRepository installmentRepo, OrderRepository comandaRepo) {
        this.installmentRepo = installmentRepo;
        this.comandaRepo = comandaRepo;
    }

    public boolean createInstallmentPlan(String orderId, int months, BigDecimal totalAmount) {
        Optional<ComandaEntity> orderOpt = comandaRepo.findByOrderId(orderId);
        if (orderOpt.isEmpty()) return false;

        ComandaEntity order = orderOpt.get();
        BigDecimal monthly = totalAmount.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);

        InstallmentPlan plan = InstallmentPlan.builder()
                .months(months)
                .monthlyAmount(monthly)
                .startDate(LocalDate.now())
                .order(order)
                .build();

        installmentRepo.save(plan);
        return true;
    }
}
