package com.example.demo.controller;

import com.example.demo.FidelityDTO;
import com.example.demo.User;
import com.example.demo.repository.UserRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Base64;

@RestController
@RequestMapping("/fidelity")
public class FidelityController {

    private final UserRepository userRepository;

    public FidelityController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<FidelityDTO> getFidelity(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                new FidelityDTO(user.getUserId(), user.getUsername(), user.getFidelityPoints())
        );
    }

    @GetMapping("/qr")
    public ResponseEntity<String> generateFidelityQR(Authentication authentication) throws WriterException, IOException {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        String data = "http://192.168.0.75:3000/fidelity/qr-view?name=" + user.getUsername()
                + "&points=" + user.getFidelityPoints()
                + "&exp=" + LocalDate.now().plusYears(1);



        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, 300, 300);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        String base64 = Base64.getEncoder().encodeToString(pngOutputStream.toByteArray());

        return ResponseEntity.ok("data:image/png;base64," + base64);
    }
}
