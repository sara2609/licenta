package com.example.demo.repository;

import com.example.demo.model.RewardHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RewardHistoryRepository extends JpaRepository<RewardHistory, Long> {
    List<RewardHistory> findByUserIdOrderByClaimedDateDesc(Long userId);
}
