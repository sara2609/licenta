package com.example.demo.controller;

import com.example.demo.CartItem;
import com.example.demo.User;
import com.example.demo.model.ComandaEntity;
import com.example.demo.model.ComandaProdus;
import com.example.demo.model.DailyReward;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.DailyRewardRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final DailyRewardRepository dailyRewardRepository;
    private final CartRepository cartRepository;

    public CartController(CartService cartService,
                          UserRepository userRepository,
                          OrderRepository orderRepository,
                          DailyRewardRepository dailyRewardRepository,
                          CartRepository cartRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.dailyRewardRepository = dailyRewardRepository;
        this.cartRepository = cartRepository;
    }

    @PostMapping("/apply-points")
    public ResponseEntity<String> applyPoints(@RequestBody Map<Long, Integer> points, Principal principal) {
        try {
            cartService.applyPoints(principal.getName(), points);
            return ResponseEntity.ok("✅ Punctele au fost aplicate!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Eroare: " + e.getMessage());
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, Object>> checkout(Principal principal) {
        String username = principal.getName();

        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("❌ Utilizator inexistent!"));

        List<CartItem> cartItems = cartService.getCartItems(username);
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "❌ Coșul este gol!"));
        }

        int totalUsedPoints = cartItems.stream().mapToInt(CartItem::getUsedPoints).sum();

        double total = cartItems.stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity() - item.getAppliedDiscount())
                .sum();

        dailyRewardRepository.findByUserId(user.getUserId()).ifPresent(reward -> {
            int remaining = reward.getTotalPoints() - totalUsedPoints;
            reward.setTotalPoints(Math.max(0, remaining));
            dailyRewardRepository.save(reward);
        });

        List<ComandaProdus> produse = cartItems.stream()
                .map(item -> new ComandaProdus(
                        item.getProduct().getName(),
                        String.format("%.2f", item.getProduct().getPrice()),
                        item.getQuantity()))
                .toList();

        String orderId = "CMD-" + System.currentTimeMillis();
        ComandaEntity entity = ComandaEntity.builder()
                .orderId(orderId)
                .clientName(user.getUsername())
                .email(user.getEmail())
                .total(String.format("%.2f", total))
                .dataComenzii(LocalDateTime.now())
                .build();

        orderRepository.save(entity);
        cartService.processOrder(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Comanda finalizată cu succes!");
        response.put("total", String.format("%.2f", total));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<String> addToCart(@PathVariable Long productId, Principal principal) {
        try {
            String username = principal.getName();
            cartService.addToCart(username, productId);
            return ResponseEntity.ok("✅ Produs adăugat în coș");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Eroare: " + e.getMessage());
        }
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<String> updateQuantity(@PathVariable Long cartItemId, @RequestParam int quantity) {
        Optional<CartItem> optionalItem = cartRepository.findById(cartItemId);
        if (optionalItem.isEmpty()) return ResponseEntity.badRequest().body("❌ Produsul nu există în coș");

        CartItem item = optionalItem.get();
        if (quantity <= 0) {
            cartRepository.delete(item);
            return ResponseEntity.ok("🗑️ Produs eliminat din coș");
        }

        item.setQuantity(quantity);
        cartRepository.save(item);
        return ResponseEntity.ok("🔄 Cantitate actualizată");
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<String> removeItem(@PathVariable Long cartItemId) {
        if (!cartRepository.existsById(cartItemId))
            return ResponseEntity.badRequest().body("❌ Item inexistent");

        cartRepository.deleteById(cartItemId);
        return ResponseEntity.ok("✅ Produs șters din coș");
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(Principal principal) {
        String username = principal.getName();
        return ResponseEntity.ok(cartService.getCartItems(username));
    }
}
