package com.example.demo.controller;

import com.example.demo.model.Message;
import com.example.demo.repository.MessageRepository;
import com.example.demo.service.EmailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageRepository messageRepository;
    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Message message, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Trebuie să fii logat pentru a trimite un mesaj!");
        }

        // ✅ Acum getName() va conține emailul din token
        String senderEmail = authentication.getName();
        message.setSenderEmail(senderEmail);
        message.setCreatedAt(LocalDateTime.now());
        messageRepository.save(message);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    @PostMapping("/reply/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> replyToMessage(@PathVariable Long id, @RequestBody String adminReply) {
        Optional<Message> optionalMessage = messageRepository.findById(id);
        if (optionalMessage.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Message message = optionalMessage.get();
        message.setAdminReply(adminReply);

        try {
            emailService.trimiteRaspunsLaUtilizator(message.getSenderEmail(), adminReply);
            messageRepository.save(message);
            return ResponseEntity.ok().build();
        } catch (MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Eroare la trimiterea emailului!");
        }
    }
}
