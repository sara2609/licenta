package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Optional;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComandaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;

    private String clientName;

    private String email;

    private String total;

    private String cupon;

    private LocalDateTime dataComenzii;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private InstallmentPlan installmentPlan;

    public Optional<String> getRateSummary() {
        if (installmentPlan == null) return Optional.empty();

        String lunar = installmentPlan.getMonthlyAmount()
                .setScale(2, java.math.RoundingMode.HALF_UP)
                .toPlainString();
        return Optional.of(lunar + " RON x " + installmentPlan.getMonths() + " luni");
    }
}
