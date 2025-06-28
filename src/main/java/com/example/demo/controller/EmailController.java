package com.example.demo.controller;

import com.example.demo.model.Comanda;
import com.example.demo.service.EmailService;
import com.example.demo.service.FacturaService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class EmailController {

    @Autowired
    private FacturaService facturaService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/send-invoice")
    public ResponseEntity<?> sendInvoice(@RequestBody Comanda comanda) {
        try {

            byte[] facturaPDF = facturaService.genereazaFacturaPDF(comanda);


            String subject = "Factura ta de la S&S Electronics";
            String body = "<h3>Bună " + comanda.getNumeClient() + ",</h3>" +
                    "<p>Găsești atașată factura pentru comanda ta.</p>" +
                    "<p>Mulțumim că ai ales S&S Electronics!</p>";


            emailService.sendEmailWithAttachment(
                    comanda.getEmailClient(), subject, body, facturaPDF, "factura.pdf"
            );

            return ResponseEntity.ok("✅ Factura trimisă cu succes!");
        } catch (MessagingException e) {
            return ResponseEntity.internalServerError().body("❌ Eroare email: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("❌ Eroare internă: " + e.getMessage());
        }
    }
}
