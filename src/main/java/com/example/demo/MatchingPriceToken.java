package com.example.demo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "matching_price_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MatchingPriceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "token_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String token; // UUID.randomUUID().toString()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(name = "approved_price", nullable = false)
    private Double approvedPrice;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MatchingPriceToken)) return false;
        MatchingPriceToken that = (MatchingPriceToken) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    // Expose productId in JSON
    @Transient
    @JsonProperty("productId")
    public Long getProductId() {
        return product != null ? product.getId() : null;
    }

    // Expose token explicitly
    @Transient
    @JsonProperty("token")
    public String getTokenValue() {
        return token;
    }

    // Expose approvedPrice explicitly (optional, dar util pt. claritate)
    @Transient
    @JsonProperty("approvedPrice")
    public Double getApprovedPriceValue() {
        return approvedPrice;
    }

}
