package com.example.demo;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private double price;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private Categorie categorie;

    @Column(nullable = false)
    private int sold = 0;

    @Column(nullable = false)
    private int stock = 0;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String details;

    // ✅ AICI este modificarea: double → Double
    @Column(name = "review_score")
    private Double reviewScore = 0.0;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<CartItem> cartItems = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Product)) return false;
        Product product = (Product) o;
        return Objects.equals(id, product.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
