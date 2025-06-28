package com.example.demo.controller;

import com.example.demo.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/ban-user/{userId}")
    public ResponseEntity<String> banUser(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        String reason = payload.get("reason");
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found.");

        User user = userOpt.get();
        user.setBanned(true);
        user.setBanReason(reason);
        userRepository.save(user);
        return ResponseEntity.ok("✅ User banned successfully.");
    }

    @PutMapping("/unban/{userId}")
    public ResponseEntity<String> unbanUser(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            user.setBanned(false);
            user.setBanReason(null);
            userRepository.save(user);
            return ResponseEntity.ok("✅ Utilizatorul a fost deblocat!");
        }).orElse(ResponseEntity.notFound().build());
    }
}


