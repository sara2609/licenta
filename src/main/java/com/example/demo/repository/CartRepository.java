package com.example.demo.repository;

import com.example.demo.CartItem;
import com.example.demo.Product;
import com.example.demo.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUser(User user);

    Optional<CartItem> findByUserAndProduct(User user, Product product); // ✅ Optional, corect

    @Query("SELECT ci FROM CartItem ci JOIN FETCH ci.product WHERE ci.user = :user")
    List<CartItem> findByUserWithProduct(User user);
}
