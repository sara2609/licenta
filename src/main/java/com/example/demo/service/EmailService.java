package com.example.demo.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void trimiteEmailSimplu(String to, String subject, String contentHtml) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setFrom("stefan.emil.cocolos@gmail.com");
        helper.setReplyTo("stefan.emil.cocolos@gmail.com");
        helper.setText(contentHtml, true);

        mailSender.send(message);
    }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachmentBytes, String fileName)
            throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true);

        helper.setFrom("stefan.emil.cocolos@gmail.com");
        helper.setReplyTo("stefan.emil.cocolos@gmail.com");

        helper.addAttachment(fileName, new ByteArrayResource(attachmentBytes));

        mailSender.send(message);
    }


    public void trimiteRaspunsLaUtilizator(String to, String mesajDeTrimis) throws MessagingException {
        trimiteEmailSimplu(to, "Răspuns la mesajul tău", mesajDeTrimis);
    }
}
