package com.example.demo.service;

import com.example.demo.CartItem;
import com.example.demo.Product;
import com.example.demo.User;
import com.example.demo.model.DailyReward;
import com.example.demo.MatchingPriceToken;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final DailyRewardRepository dailyRewardRepository;
    private final MatchingPriceTokenService matchingPriceTokenService;

    public CartService(CartRepository cartRepository,
                       UserRepository userRepository,
                       ProductRepository productRepository,
                       DailyRewardRepository dailyRewardRepository,
                       MatchingPriceTokenService matchingPriceTokenService) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.dailyRewardRepository = dailyRewardRepository;
        this.matchingPriceTokenService = matchingPriceTokenService;
    }

    @Transactional
    public void applyPoints(String username, Map<Long, Integer> pointsMap) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        DailyReward reward = dailyRewardRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Reward entry not found"));

        List<CartItem> items = cartRepository.findByUserWithProduct(user);
        int available = reward.getTotalPoints();
        int totalUsed = 0;

        for (CartItem item : items) {
            Long productId = item.getProduct().getId();
            int toApply = pointsMap.getOrDefault(productId, 0);

            if (item.isPointsApplied() || toApply <= 0) continue;

            if (toApply > 500) toApply = 500;
            totalUsed += toApply;

            double price = item.getMatchingPrice() != null ? item.getMatchingPrice() : item.getProduct().getPrice();
            double discountRate = (toApply / 100.0) * 0.05;
            double discount = price * item.getQuantity() * discountRate;

            item.setUsedPoints(toApply);
            item.setAppliedDiscount(discount);
            item.setPointsApplied(true);
        }

        if (totalUsed > available) {
            throw new RuntimeException("❌ Nu ai suficiente puncte!");
        }

        reward.setTotalPoints(available - totalUsed);
        dailyRewardRepository.save(reward);
        cartRepository.saveAll(items);
    }

    @Transactional
    public void processOrder(User user) {
        List<CartItem> items = cartRepository.findByUserWithProduct(user);

        for (CartItem item : items) {
            Product product = item.getProduct();
            int quantity = item.getQuantity();

            if (product.getStock() < quantity) {
                throw new RuntimeException("Stoc insuficient pentru: " + product.getName());
            }

            // ✅ Folosește matchingPrice dacă este setat, altfel prețul normal
            double pricePerUnit = item.getMatchingPrice() != null ? item.getMatchingPrice() : product.getPrice();

            System.out.printf("Produs %s: %.2f RON x %d bucăți%n", product.getName(), pricePerUnit, quantity);

            product.setStock(product.getStock() - quantity);
            product.setSold(product.getSold() + quantity);
            productRepository.save(product);
        }

        clearCart(user);
    }

    @Transactional
    public void clearCart(User user) {
        List<CartItem> items = cartRepository.findByUser(user);
        cartRepository.deleteAll(items);
    }

    public List<CartItem> getCartItems(String username) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found"));
        return cartRepository.findByUserWithProduct(user);
    }

    @Transactional
    public void addToCart(String username, Long productId) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingItemOpt = cartRepository.findByUserAndProduct(user, product);
        CartItem item;
        if (existingItemOpt.isPresent()) {
            item = existingItemOpt.get();
            item.setQuantity(item.getQuantity() + 1);
        } else {
            item = new CartItem(user, product, 1);
            item.setUsedPoints(0);
            item.setAppliedDiscount(0);
            item.setPointsApplied(false);
        }

        cartRepository.save(item);
    }

    @Transactional
    public void addToCartWithToken(String username, Long productId, String token) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        MatchingPriceToken validatedToken = matchingPriceTokenService
                .validateToken(token, user.getUserId(), productId);

        if (validatedToken == null) {
            throw new RuntimeException("Tokenul de matching nu este valid!");
        }

        Optional<CartItem> existingItemOpt = cartRepository.findByUserAndProduct(user, product);
        CartItem item;
        if (existingItemOpt.isPresent()) {
            item = existingItemOpt.get();
            item.setQuantity(item.getQuantity() + 1);
        } else {
            item = new CartItem(user, product, 1);
        }

        // ✅ Asigurăm setarea explicită a câmpurilor
        item.setUsedPoints(0);
        item.setAppliedDiscount(0);
        item.setPointsApplied(false);
        item.setMatchingPrice(validatedToken.getApprovedPrice());  // 🟢 SETARE AICI!

        cartRepository.save(item);
    }


}
