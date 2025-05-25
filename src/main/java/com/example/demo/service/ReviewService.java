package com.example.demo.service;

import com.example.demo.Review;
import com.example.demo.User;
import com.example.demo.model.ReviewRequest;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public Review addReview(String identifier, Long productId, int rating, String comment) {
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new IllegalArgumentException("❌ Utilizatorul nu a fost găsit!"));

        if (productId == null || !productRepository.existsById(productId)) {
            throw new IllegalArgumentException("❌ Produsul nu există!");
        }

        // Verifică dacă userul a mai lăsat review
        if (reviewRepository.existsByUserIdAndProductId(user.getUserId(), productId)) {
            throw new IllegalStateException("❗ Ați adăugat deja un review la acest produs!");
        }

        Review review = new Review();
        review.setUserId(user.getUserId());
        review.setProductId(productId);
        review.setRating(rating);
        review.setComment(comment);

        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    public List<Review> getReviewsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("❌ Utilizatorul nu a fost găsit!"));
        return reviewRepository.findByUserId(user.getUserId());
    }
}

