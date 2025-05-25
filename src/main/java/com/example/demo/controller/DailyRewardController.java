// ✅ DAILYREWARD CONTROLLER - USES POINTS FROM daily_reward
package com.example.demo.controller;

import com.example.demo.model.DailyReward;
import com.example.demo.model.RewardHistory;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.DailyRewardService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
public class DailyRewardController {

    @Autowired
    private DailyRewardService rewardService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/claim")
    public DailyReward claimReward(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        return rewardService.claimDailyReward(userId);
    }

    @GetMapping("/status")
    public DailyReward getStatus(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        return rewardService.getRewardStatus(userId);
    }

    @GetMapping("/history")
    public List<RewardHistory> getRewardHistory(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        return rewardService.getRewardHistory(userId);
    }

    @GetMapping("/points")
    public ResponseEntity<Integer> getPoints(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        int points = rewardService.getRewardStatus(userId).getTotalPoints();
        return ResponseEntity.ok(points);
    }

    private Long getUserIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Token JWT lipsă sau invalid");
    }
}