package com.example.demo.service;

import com.example.demo.*;
import com.example.demo.repository.MatchingPriceRequestRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MatchingPriceRequestService {

    private final MatchingPriceRequestRepository repository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public MatchingPriceRequest createRequest(Long userId, Long productId, String message, Double requestedPrice) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        MatchingPriceRequest request = new MatchingPriceRequest();
        request.setUser(user);
        request.setProduct(product);
        request.setMessage(message);
        request.setRequestedPrice(requestedPrice);
        request.setStatus(MatchingPriceStatus.PENDING);

        return repository.save(request);
    }

    public List<MatchingPriceRequest> getRequestsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return repository.findByUser(user);
    }

    public List<MatchingPriceRequest> getAllPendingRequests() {
        return repository.findByStatus(MatchingPriceStatus.PENDING);
    }

    public MatchingPriceRequest approveRequest(Long requestId) {
        MatchingPriceRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(MatchingPriceStatus.APPROVED);
        return repository.save(request);
    }

    public MatchingPriceRequest rejectRequest(Long requestId, String adminResponse) {
        MatchingPriceRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(MatchingPriceStatus.REJECTED);
        request.setAdminResponse(adminResponse);
        return repository.save(request);
    }

    public Optional<MatchingPriceRequest> getById(Long id) {
        return repository.findById(id);
    }
}
