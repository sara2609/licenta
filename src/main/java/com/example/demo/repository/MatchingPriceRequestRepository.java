package com.example.demo.repository;

import com.example.demo.MatchingPriceRequest;
import com.example.demo.MatchingPriceStatus;
import com.example.demo.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchingPriceRequestRepository extends JpaRepository<MatchingPriceRequest, Long> {
    List<MatchingPriceRequest> findByUser(User user);
    List<MatchingPriceRequest> findByStatus(MatchingPriceStatus status);
}
