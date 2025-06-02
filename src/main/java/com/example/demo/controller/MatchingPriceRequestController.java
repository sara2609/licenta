package com.example.demo.controller;

import com.example.demo.MatchingPriceRequest;
import com.example.demo.MatchingPriceToken;
import com.example.demo.service.EmailService;
import com.example.demo.service.MatchingPriceRequestService;
import com.example.demo.service.MatchingPriceTokenService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/matching-price")
@RequiredArgsConstructor
public class MatchingPriceRequestController {

    private final MatchingPriceRequestService service;
    private final EmailService emailService;
    private final MatchingPriceTokenService tokenService;

    @PostMapping("/create")
    public ResponseEntity<MatchingPriceRequest> createRequest(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam String message,
            @RequestParam Double requestedPrice) {

        return ResponseEntity.ok(service.createRequest(userId, productId, message, requestedPrice));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MatchingPriceRequest>> getUserRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getRequestsByUser(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<MatchingPriceRequest>> getPendingRequests() {
        return ResponseEntity.ok(service.getAllPendingRequests());
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<String> approveRequest(@PathVariable Long id) {
        MatchingPriceRequest approved = service.approveRequest(id);
        String token = tokenService.generateTokenForApprovedRequest(id);

        try {
            emailService.trimiteRaspunsLaUtilizator(
                    approved.getUser().getEmail(),
                    "<h3>Cererea ta de Matching Price a fost <span style='color:green;'>aprobată</span></h3>" +
                            "<p>Poți finaliza comanda la prețul dorit: <strong>" + approved.getRequestedPrice() +
                            " RON</strong>.</p><p>Tokenul tău de preț aprobat este:</p><code>" + token + "</code>"
            );
        } catch (MessagingException e) {
            System.err.println("Eroare la trimiterea emailului de aprobare: " + e.getMessage());
        }

        return ResponseEntity.ok(token);
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<MatchingPriceRequest> rejectRequest(
            @PathVariable Long id,
            @RequestParam String response) {

        MatchingPriceRequest rejected = service.rejectRequest(id, response);

        try {
            emailService.trimiteRaspunsLaUtilizator(
                    rejected.getUser().getEmail(),
                    "<h3>Cererea ta de Matching Price a fost <span style='color:red;'>respinsă</span></h3>" +
                            "<p><strong>Motiv:</strong> " + response + "</p>"
            );
        } catch (MessagingException e) {
            System.err.println("Eroare la trimiterea emailului de respingere: " + e.getMessage());
        }

        return ResponseEntity.ok(rejected);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchingPriceRequest> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔥 MODIFICAT: Returnează doar ce are nevoie frontend-ul (productId + approvedPrice)
    @GetMapping("/tokens/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getTokensForUser(@PathVariable Long userId) {
        List<MatchingPriceToken> tokens = tokenService.getActiveTokensForUser(userId);

        List<Map<String, Object>> simplified = tokens.stream().map(token -> {
            Map<String, Object> map = new HashMap<>();
            map.put("productId", token.getProduct().getId());
            map.put("approvedPrice", token.getApprovedPrice());
            map.put("validUntil", token.getValidUntil());
            return map;
        }).toList();

        return ResponseEntity.ok(simplified);
    }
}
