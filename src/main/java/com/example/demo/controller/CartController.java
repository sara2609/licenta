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
import com.example.demo.service.InstallmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
    private final InstallmentService installmentService;

    public CartController(CartService cartService,
                          UserRepository userRepository,
                          OrderRepository orderRepository,
                          DailyRewardRepository dailyRewardRepository,
                          CartRepository cartRepository,
                          InstallmentService installmentService) {
        this.cartService = cartService;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.dailyRewardRepository = dailyRewardRepository;
        this.cartRepository = cartRepository;
        this.installmentService = installmentService;
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
    public ResponseEntity<Map<String, Object>> checkout(@RequestBody Map<String, Object> payload, Principal principal) {
        String username = principal.getName();
        String payment = (String) payload.get("payment");

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

        // ✅ Salvează plan de rate dacă e trimis din payload
        if (payload.containsKey("months")) {
            Object monthsObj = payload.get("months");
            if (monthsObj != null) {
                try {
                    int months = Integer.parseInt(monthsObj.toString());
                    installmentService.createInstallmentPlan(orderId, months, BigDecimal.valueOf(total));
                } catch (Exception e) {
                    System.out.println("❌ Eroare la salvarea planului de rate: " + e.getMessage());
                }
            }
        }

        cartService.processOrder(user, payment);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Comanda finalizată cu succes!");
        response.put("total", String.format("%.2f", total));
        response.put("orderId", orderId); // ✅ Poate fi util în frontend

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

    @PostMapping("/add-with-token")
    public ResponseEntity<String> addToCartWithToken(@RequestBody Map<String, Object> payload, Principal principal) {
        try {
            String username = principal.getName();
            Long productId = Long.parseLong(payload.get("productId").toString());
            String token = payload.get("token").toString();

            cartService.addToCartWithToken(username, productId, token);
            return ResponseEntity.ok("✅ Produs adăugat în coș cu Matching Price!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Eroare la adăugare cu token: " + e.getMessage());
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

    @PostMapping("/clear-after-payment")
    public ResponseEntity<String> clearCartAfterPayment(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        cartService.clearCart(user);
        return ResponseEntity.ok("✅ Coșul a fost golit după plata cu cardul!");
    }
}
