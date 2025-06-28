
package com.example.demo.model;

import com.example.demo.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fidelity_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FidelityPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int points;

    private LocalDateTime awardedAt;
}
