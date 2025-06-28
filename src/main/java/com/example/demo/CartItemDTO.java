package com.example.demo;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String name;
    private Double price;
    private Double originalPrice;
    private int quantity;
    private int usedPoints;
    private boolean pointsApplied;
    private double appliedDiscount;
}
