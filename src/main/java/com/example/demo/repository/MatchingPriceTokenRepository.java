package com.example.demo.repository;

import com.example.demo.MatchingPriceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MatchingPriceTokenRepository extends JpaRepository<MatchingPriceToken, Long> {
    Optional<MatchingPriceToken> findByToken(String token);
}
