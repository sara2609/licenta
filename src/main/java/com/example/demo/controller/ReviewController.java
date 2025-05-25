package com.example.demo.controller;

import com.example.demo.Review;
import com.example.demo.model.ReviewRequest;
import com.example.demo.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addReview(@RequestBody ReviewRequest request, Authentication authentication) {
        String username = authentication.getName();
        try {
            Review review = reviewService.addReview(username, request.getProductId(), request.getRating(), request.getComment());
            return ResponseEntity.ok(review);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getReviewsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    @GetMapping("/user")
    public ResponseEntity<List<Review>> getReviewsByUser(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(reviewService.getReviewsByUser(username));
    }
}

