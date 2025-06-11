package com.example.demo.repository;

import com.example.demo.model.InstallmentPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstallmentPlanRepository extends JpaRepository<InstallmentPlan, Long> {
}
