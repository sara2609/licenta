package com.example.demo.repository;

import com.example.demo.model.DailyReward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DailyRewardRepository extends JpaRepository<DailyReward, Long> {
    Optional<DailyReward> findByUserId(Long userId);
}
