package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_message")
    private Long idMessage; // ✅ am corectat numele: camelCase, respectă Java conventions

    @Column(name = "sender_email", nullable = false)
    private String senderEmail;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(name = "admin_reply")
    private String adminReply;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
