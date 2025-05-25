package com.example.demo.repository;

import com.example.demo.model.FidelityPoint;
import com.example.demo.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FidelityPointRepository extends JpaRepository<FidelityPoint, Long> {
    List<FidelityPoint> findByUser(User user);
}
