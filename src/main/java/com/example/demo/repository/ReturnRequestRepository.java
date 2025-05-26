package com.example.demo.repository;

import com.example.demo.ReturnRequest;
import com.example.demo.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    List<ReturnRequest> findByStatus(ReturnStatus status);
}
