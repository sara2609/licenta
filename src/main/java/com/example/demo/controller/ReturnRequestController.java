package com.example.demo.controller;

import com.example.demo.ReturnRequest;
import com.example.demo.service.ReturnRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
@CrossOrigin(origins = "http://localhost:3000")
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    public ReturnRequestController(ReturnRequestService returnRequestService) {
        this.returnRequestService = returnRequestService;
    }


    @PostMapping
    public ResponseEntity<?> submitReturn(@RequestBody ReturnRequest returnRequest) {
        try {
            ReturnRequest saved = returnRequestService.submit(returnRequest);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Eroare la salvarea cererii de retur.");
        }
    }


    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReturnRequest> getAllReturns() {
        return returnRequestService.getAll();
    }


    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            ReturnRequest updated = returnRequestService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Status invalid: trebuie să fie APPROVED / REJECTED.");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Eroare internă la actualizarea statusului.");
        }
    }
}
