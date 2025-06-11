package com.example.demo.repository;

import com.example.demo.model.ComandaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<ComandaEntity, Long> {
    Optional<ComandaEntity> findByOrderId(String orderId); // 👈 adaugă asta
}
