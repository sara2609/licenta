package com.example.demo.service;

import com.example.demo.MatchingPriceRequest;
import com.example.demo.MatchingPriceToken;
import com.example.demo.repository.MatchingPriceRequestRepository;
import com.example.demo.repository.MatchingPriceTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingPriceTokenService {

    private final MatchingPriceTokenRepository tokenRepository;
    private final MatchingPriceRequestRepository requestRepository;

    @Transactional
    public String generateTokenForApprovedRequest(Long requestId) {
        MatchingPriceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Matching request not found"));

        if (!request.getStatus().name().equals("APPROVED")) {
            throw new RuntimeException("Matching request is not approved");
        }

        MatchingPriceToken token = new MatchingPriceToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(request.getUser());
        token.setProduct(request.getProduct());
        token.setApprovedPrice(request.getRequestedPrice());
        token.setCreatedAt(LocalDateTime.now());
        token.setValidUntil(LocalDateTime.now().plusHours(24));

        tokenRepository.save(token);
        return token.getToken();
    }

    public MatchingPriceToken validateToken(String token, Long userId, Long productId) {
        return tokenRepository.findByToken(token)
                .filter(t -> t.getValidUntil().isAfter(LocalDateTime.now()))
                .filter(t -> t.getUser().getUserId().equals(userId))
                .filter(t -> t.getProduct().getId().equals(productId))
                .orElse(null);
    }

    public List<MatchingPriceToken> getActiveTokensForUser(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        return tokenRepository.findAll().stream()
                .filter(t -> t.getUser().getUserId().equals(userId))
                .filter(t -> t.getValidUntil().isAfter(now))
                .collect(Collectors.toList());
    }

    @Transactional
    public void invalidateToken(Long userId, Long productId) {
        List<MatchingPriceToken> tokens = tokenRepository.findByUserUserIdAndProduct_Id(userId, productId);
        tokenRepository.deleteAll(tokens);
    }

}
