package com.example.demo.repository;

import com.example.demo.model.ComandaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<ComandaEntity, Long> {
}
