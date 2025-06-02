package com.example.demo.repository;

import com.example.demo.Product;
import com.example.demo.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByPriceBetween(double minPrice, double maxPrice);
    List<Product> findAll(Sort sort);
    List<Product> findByCategorie(Categorie categorie);
    List<Product> findTop3ByCategorieOrderBySoldDesc(Categorie categorie);

    @Query("SELECT p FROM Product p WHERE p.id IN :ids")
    List<Product> findByIdIn(@Param("ids") List<Long> ids);

    List<Product> findByStockLessThanEqual(int stock);

    // 🔥 Nou: sortare după scor recenzie
    List<Product> findAllByOrderByReviewScoreDesc();

    // 🔥 Nou: sortare după cele mai vândute
    List<Product> findAllByOrderBySoldDesc();
}
