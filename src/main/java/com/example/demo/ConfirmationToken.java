package com.example.demo;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String token;

    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
