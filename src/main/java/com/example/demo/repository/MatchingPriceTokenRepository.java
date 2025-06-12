package com.example.demo.repository;

import com.example.demo.MatchingPriceToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchingPriceTokenRepository extends JpaRepository<MatchingPriceToken, Long> {
    Optional<MatchingPriceToken> findByToken(String token);
    List<MatchingPriceToken> findByUserUserIdAndProduct_Id(Long userId, Long productId);

}
