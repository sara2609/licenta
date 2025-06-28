package com.example.demo.service;

import com.example.demo.ReturnRequest;
import com.example.demo.ReturnStatus;
import com.example.demo.repository.ReturnRequestRepository;
import com.example.demo.service.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReturnRequestService {

    private final ReturnRequestRepository repository;
    private final EmailService emailService;

    public ReturnRequestService(ReturnRequestRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    public ReturnRequest submit(ReturnRequest request) {
        request.setStatus(ReturnStatus.PENDING);
        return repository.save(request);
    }

    public List<ReturnRequest> getAll() {
        return repository.findAll();
    }

    public ReturnRequest updateStatus(Long id, String statusString) {
        ReturnRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cererea nu a fost găsită"));

        ReturnStatus status = ReturnStatus.valueOf(statusString.toUpperCase());
        request.setStatus(status);
        repository.save(request);


        if (status == ReturnStatus.APPROVED) {
            try {
                emailService.trimiteEmailSimplu(
                        request.getEmail(),
                        "✅ Retur aprobat",
                        "<h3>Cererea ta de retur a fost <span style='color:green;'>aprobată</span>.</h3>" +
                                "<p>Veți primi instrucțiuni de retur în curând.</p>"
                );
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }

        return request;
    }
}
