package com.example.demo.service;

import com.example.demo.Factura;
import com.example.demo.model.Comanda;
import com.example.demo.model.ComandaProdus;
import com.example.demo.repository.FacturaRepository;
import com.example.demo.repository.OrderRepository;
import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;

@Service
public class FacturaService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private FacturaRepository facturaRepository;

    @Autowired
    private OrderRepository orderRepository;

    public byte[] genereazaFacturaPDF(Comanda comanda) throws Exception {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        document.open();

        document.add(new Paragraph("Factura pentru: " + comanda.getNumeClient()));
        document.add(new Paragraph("Comanda: " + comanda.getOrderId()));
        document.add(new Paragraph("Data: " + LocalDateTime.now()));
        document.add(new Paragraph("\nProduse:"));

        for (ComandaProdus p : comanda.getProducts()) {
            document.add(new Paragraph("- " + p.getQuantity() + " x " + p.getName() + " @ " + p.getPrice()));
        }

        document.add(new Paragraph("\nTotal: " + comanda.getTotal()));
        document.close();

        return baos.toByteArray();
    }

    public void trimiteFactura(Comanda comanda) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(comanda.getEmailClient());
        helper.setSubject("🧾 Confirmare comandă - S&S Electronics");
        helper.setFrom("stefan.emil.cocolos@gmail.com");
        helper.setReplyTo("stefan.emil.cocolos@gmail.com");

        double total = Double.parseDouble(comanda.getTotal());
        double reducere = 0.0;

        if (comanda.getCouponCode() != null && !comanda.getCouponCode().isEmpty()
                && comanda.getCouponCode().equalsIgnoreCase("WELCOME10")) {
            reducere = total * 0.10;
            total = total - reducere;
        }

        comanda.setTotal(String.format("%.2f", total));

        String body = "Salut, " + comanda.getNumeClient() + "!\n\n"
                + "Îți mulțumim pentru comandă. Comanda ta #" + comanda.getOrderId() + " a fost primită!\n"
                + "Total inițial: " + String.format("%.2f", total + reducere) + "\n"
                + (reducere > 0 ? "Reducere aplicată: -" + String.format("%.2f", reducere) + "\n" : "")
                + "Total de plată: " + String.format("%.2f", total) + "\n\n"
                + "Factura este atașată.\nO zi bună,\nS&S Electronics";

        helper.setText(body, false);

        byte[] pdfBytes = genereazaFacturaPDF(comanda);
        helper.addAttachment("factura-" + comanda.getOrderId() + ".pdf", new ByteArrayResource(pdfBytes));

        mailSender.send(message);

        Factura factura = Factura.builder()
                .orderId(comanda.getOrderId())
                .clientName(comanda.getNumeClient())
                .email(comanda.getEmailClient())
                .total(String.valueOf(total))
                .filePath("PDF trimis prin email")
                .dataEmitere(LocalDateTime.now())
                .build();

        facturaRepository.save(factura);
    }

    public String getRateSummaryForOrder(String orderId) {
        return orderRepository.findByOrderId(orderId)
                .flatMap(c -> c.getRateSummary())
                .orElse(null);
    }
}
