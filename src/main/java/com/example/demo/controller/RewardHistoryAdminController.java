package com.example.demo.controller;

import com.example.demo.model.RewardHistory;
import com.example.demo.repository.RewardHistoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/reward-history")
public class RewardHistoryAdminController {

    private final RewardHistoryRepository rewardHistoryRepository;

    public RewardHistoryAdminController(RewardHistoryRepository rewardHistoryRepository) {
        this.rewardHistoryRepository = rewardHistoryRepository;
    }

    @GetMapping
    public List<RewardHistory> getAllHistory() {
        return rewardHistoryRepository.findAll();
    }
}
