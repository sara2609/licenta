package com.example.demo;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wishlist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id") // ✅ Corectăm referința la User
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id", referencedColumnName = "product_id") // ✅ Corectăm referința la Product
    private Product product;
}
