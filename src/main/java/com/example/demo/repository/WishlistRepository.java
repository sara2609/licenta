package com.example.demo.repository;

import com.example.demo.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    // ❌ Era findByUserId → ✅ Acum folosim findByUser_UserId
    List<Wishlist> findByUser_UserId(Long userId);
}
