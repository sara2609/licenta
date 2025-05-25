package com.example.demo.service;

import com.example.demo.model.DailyReward;
import com.example.demo.model.RewardHistory;
import com.example.demo.repository.DailyRewardRepository;
import com.example.demo.repository.RewardHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DailyRewardService {

    @Autowired
    private DailyRewardRepository dailyRewardRepository;

    @Autowired
    private RewardHistoryRepository rewardHistoryRepository;

    private DailyReward ensureRewardExists(Long userId) {
        return dailyRewardRepository.findByUserId(userId)
                .orElseGet(() -> {
                    DailyReward reward = new DailyReward();
                    reward.setUserId(userId);
                    reward.setCurrentStreak(0);
                    reward.setTotalPoints(0);
                    reward.setLastClaimedDate(null);
                    return dailyRewardRepository.save(reward);
                });
    }

    public DailyReward claimDailyReward(Long userId) {
        DailyReward reward = ensureRewardExists(userId);
        LocalDate today = LocalDate.now();

        if (reward.getLastClaimedDate() == null || reward.getLastClaimedDate().isBefore(today.minusDays(1))) {
            reward.setCurrentStreak(1);
        } else if (reward.getLastClaimedDate().isBefore(today)) {
            reward.setCurrentStreak(reward.getCurrentStreak() + 1);
        }

        if (reward.getLastClaimedDate() == null || reward.getLastClaimedDate().isBefore(today)) {
            int streak = reward.getCurrentStreak();
            int pointsEarned = (streak % 7 == 0) ? 20 : streak;

            reward.setTotalPoints(reward.getTotalPoints() + pointsEarned);
            reward.setLastClaimedDate(today);
            dailyRewardRepository.save(reward);

            RewardHistory history = RewardHistory.builder()
                    .userId(userId)
                    .pointsAwarded(pointsEarned)
                    .claimedDate(today)
                    .build();
            rewardHistoryRepository.save(history);
        }

        return reward;
    }

    public DailyReward getRewardStatus(Long userId) {
        return ensureRewardExists(userId);
    }

    public List<RewardHistory> getRewardHistory(Long userId) {
        return rewardHistoryRepository.findByUserIdOrderByClaimedDateDesc(userId);
    }

    public void spendPoints(Long userId, int pointsToSpend) {
        DailyReward reward = dailyRewardRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Daily reward record not found"));

        if (reward.getTotalPoints() < pointsToSpend) {
            throw new RuntimeException("Puncte insuficiente");
        }

        reward.setTotalPoints(reward.getTotalPoints() - pointsToSpend);
        dailyRewardRepository.save(reward);
    }
}
