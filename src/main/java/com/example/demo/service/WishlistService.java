package com.example.demo.service;

import com.example.demo.CartItem;
import com.example.demo.Product;
import com.example.demo.User;
import com.example.demo.Wishlist;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;

    public WishlistService(WishlistRepository wishlistRepository,
                           UserRepository userRepository,
                           ProductRepository productRepository,
                           CartRepository cartRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
    }

    public String addToWishlist(String username, Long productId) {
        Optional<User> userOpt = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username));
        Optional<Product> productOpt = productRepository.findById(productId);

        if (userOpt.isEmpty() || productOpt.isEmpty()) {
            return "❌ User sau produs inexistent!";
        }

        User user = userOpt.get();
        Product product = productOpt.get();

        boolean exists = wishlistRepository.findByUser_UserId(user.getUserId())
                .stream()
                .anyMatch(item -> item.getProduct().getId().equals(productId));

        if (exists) {
            return "⚠️ Produsul este deja în wishlist!";
        }

        boolean inCart = cartRepository.findByUserAndProduct(user, product).isPresent();
        if (inCart) return "⚠️ Produsul este deja în coș!";

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        wishlistRepository.save(wishlist);

        return "✅ Produs adăugat în wishlist!";
    }

    public List<Product> getWishlist(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username));
        if (userOpt.isEmpty()) return List.of();

        Long userId = userOpt.get().getUserId();
        return wishlistRepository.findByUser_UserId(userId)
                .stream()
                .map(Wishlist::getProduct)
                .collect(Collectors.toList());
    }

    @Transactional
    public String removeFromWishlist(String username, Long productId) {
        Optional<User> userOpt = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username));
        if (userOpt.isEmpty()) return "❌ User inexistent!";

        Long userId = userOpt.get().getUserId();
        List<Wishlist> wishlistItems = wishlistRepository.findByUser_UserId(userId);

        for (Wishlist item : wishlistItems) {
            if (item.getProduct().getId().equals(productId)) {
                wishlistRepository.delete(item);
                wishlistRepository.flush();
                return "✅ Produs șters din wishlist!";
            }
        }

        return "⚠️ Produsul nu există în wishlist!";
    }

    @Transactional
    public String moveProductToCart(String username, Long productId) {
        Optional<User> userOpt = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username));
        Optional<Product> productOpt = productRepository.findById(productId);

        if (userOpt.isEmpty() || productOpt.isEmpty()) return "❌ User sau produs inexistent!";

        User user = userOpt.get();
        Product product = productOpt.get();

        wishlistRepository.findByUser_UserId(user.getUserId())
                .stream()
                .filter(w -> w.getProduct().getId().equals(productId))
                .findFirst()
                .ifPresent(wishlistRepository::delete);

        Optional<CartItem> existingItem = cartRepository.findByUserAndProduct(user, product);
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + 1);
            cartRepository.save(item);
        } else {
            CartItem item = new CartItem(user, product, 1);
            cartRepository.save(item);
        }

        return "✅ Mutat în coș!";
    }
}
