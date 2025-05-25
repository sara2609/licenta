package com.example.demo.service;

import com.example.demo.model.Message;
import com.example.demo.repository.MessageRepository;
import jakarta.mail.MessagingException;
import org.springframework.stereotype.Service;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final EmailService emailService;

    public MessageService(MessageRepository messageRepository, EmailService emailService) {
        this.messageRepository = messageRepository;
        this.emailService = emailService;
    }

    public void replyToMessage(Long idMessage, String adminReply) {
        Message message = messageRepository.findById(idMessage)
                .orElseThrow(() -> new RuntimeException("Mesajul nu a fost găsit!"));

        message.setAdminReply(adminReply);
        messageRepository.save(message);

        try {
            emailService.trimiteEmailSimplu(
                    message.getSenderEmail(),
                    "📩 Răspuns la solicitarea ta",
                    "<h2>Răspuns Admin:</h2><p>" + adminReply + "</p>"
            );
        } catch (MessagingException e) {
            throw new RuntimeException("❌ Eroare la trimiterea emailului de răspuns.", e);
        }
    }
}
