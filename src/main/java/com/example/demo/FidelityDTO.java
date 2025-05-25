// ✅ DTO pentru datele de fidelitate
package com.example.demo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FidelityDTO {
    private Long userId;
    private String username;
    private int points;
}
