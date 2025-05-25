package com.example.demo.controller;

import com.example.demo.ConfirmationToken;
import com.example.demo.Role;
import com.example.demo.User;
import com.example.demo.model.ChangePasswordRequest;
import com.example.demo.model.PasswordResetToken;
import com.example.demo.repository.ConfirmationTokenRepository;
import com.example.demo.repository.PasswordResetTokenRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ConfirmationTokenRepository confirmationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          ConfirmationTokenRepository confirmationTokenRepository,
                          PasswordResetTokenRepository passwordResetTokenRepository,
                          EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.confirmationTokenRepository = confirmationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String identifier = payload.get("identifier");
        String password = payload.get("password");

        Optional<User> optionalUser = userRepository.findByUsername(identifier);
        if (optionalUser.isEmpty()) {
            optionalUser = userRepository.findByEmail(identifier);
        }

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Contul nu există.");
        }

        User user = optionalUser.get();

        if (!user.isEnabled()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Contul nu este activat.");
        }

        if (user.isBanned()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("❌ Ați fost blocat pe acest site. Motiv: " + user.getBanReason());
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Parolă greșită.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getUserId());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());
        response.put("email", user.getEmail());
        response.put("username", user.getUsername());
        response.put("userId", user.getUserId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");
        String email = payload.get("email");

        if (username == null || password == null || email == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("❌ Username, email și parola sunt obligatorii!");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("❌ Username deja există!");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("❌ Email deja folosit!");
        }

        User user = new User(username, passwordEncoder.encode(password), email, Role.USER);
        user.setEnabled(false);
        userRepository.save(user);

        String token = UUID.randomUUID().toString();

        ConfirmationToken confirmationToken = ConfirmationToken.builder()
                .token(token)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .user(user)
                .build();

        confirmationTokenRepository.save(confirmationToken);

        String link = "http://localhost:3000/confirm?token=" + token;

        try {
            emailService.trimiteEmailSimplu(
                    email,
                    "✅ Confirmare cont - S&S Electronics",
                    "<h3>Bun venit, " + username + "!</h3>" +
                            "<p>Apasă pe link-ul de mai jos pentru a-ți activa contul:</p>" +
                            "<a href=\"" + link + "\">Activare cont</a>" +
                            "<p>Linkul expiră în 15 minute.</p>"
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Eroare la trimiterea emailului: " + e.getMessage());
        }

        return ResponseEntity.ok("✅ Cont creat! Verifică emailul pentru activare.");
    }

    @GetMapping("/confirm")
    public ResponseEntity<Map<String, String>> confirmAccount(@RequestParam("token") String token) {
        Map<String, String> response = new HashMap<>();

        ConfirmationToken confirmationToken = confirmationTokenRepository.findByToken(token).orElse(null);

        if (confirmationToken == null) {
            response.put("status", "info");
            response.put("message", "✅ Contul a fost deja activat sau linkul a expirat.");
            return ResponseEntity.ok(response);
        }

        if (confirmationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            response.put("status", "error");
            response.put("message", "❌ Link expirat.");
            return ResponseEntity.badRequest().body(response);
        }

        User user = confirmationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        confirmationTokenRepository.delete(confirmationToken);

        response.put("status", "success");
        response.put("message", "✅ Cont activat cu succes!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Nu ești autentificat.");
        }

        Optional<User> optionalUser = userRepository.findByEmail(principal.getName());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Utilizatorul nu a fost găsit.");
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("❌ Parola veche este greșită.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        try {
            emailService.trimiteEmailSimplu(
                    user.getEmail(),
                    "🔐 Parola a fost schimbată",
                    "Salut, parola ta a fost modificată cu succes.\nDacă nu ai fost tu, contactează suportul imediat!"
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("✅ Parola a fost schimbată, dar nu s-a putut trimite emailul.");
        }

        return ResponseEntity.ok("✅ Parola a fost schimbată cu succes!");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Emailul nu a fost găsit.");
        }

        User user = optionalUser.get();

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .user(user)
                .build();

        passwordResetTokenRepository.save(resetToken);

        String link = "http://localhost:3000/reset-password?token=" + token;

        try {
            emailService.trimiteEmailSimplu(
                    user.getEmail(),
                    "🔐 Resetare parolă - S&S Electronics",
                    "Salut!<br><br>Apasă pe link-ul de mai jos pentru a-ți reseta parola:<br><br>" +
                            "<a href=\"" + link + "\">Resetare parolă</a><br><br>Acest link expiră în 15 minute."
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ Eroare la trimiterea emailului.");
        }

        return ResponseEntity.ok("✅ Linkul a fost trimis.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        Optional<PasswordResetToken> optionalToken = passwordResetTokenRepository.findByToken(token);
        if (optionalToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token invalid.");
        }

        PasswordResetToken resetToken = optionalToken.get();

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tokenul a expirat.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);

        return ResponseEntity.ok("✅ Parola a fost resetată!");
    }
}
