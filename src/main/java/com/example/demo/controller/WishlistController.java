package com.example.demo.controller;

import com.example.demo.Product;
import com.example.demo.service.CartService;
import com.example.demo.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
@CrossOrigin(origins = "http://localhost:3000")
public class WishlistController {

    private final WishlistService wishlistService;
    private final CartService cartService;

    public WishlistController(WishlistService wishlistService, CartService cartService) {
        this.wishlistService = wishlistService;
        this.cartService = cartService;
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<String> addToWishlist(Authentication authentication, @PathVariable Long productId) {
        String username = authentication.getName();
        return ResponseEntity.ok(wishlistService.addToWishlist(username, productId));
    }

    @GetMapping
    public ResponseEntity<List<Product>> getWishlist(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(wishlistService.getWishlist(username));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<String> removeFromWishlist(Authentication authentication, @PathVariable Long productId) {
        String username = authentication.getName();
        return ResponseEntity.ok(wishlistService.removeFromWishlist(username, productId));
    }

    @PostMapping("/move-to-cart/{productId}")
    @Transactional
    public ResponseEntity<String> moveToCart(Authentication authentication, @PathVariable Long productId) {
        String username = authentication.getName();
        try {
            String result = wishlistService.moveProductToCart(username, productId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Eroare: " + e.getMessage());
        }
    }
}
