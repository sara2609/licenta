package com.example.demo.controller;

import com.example.demo.Factura;
import com.example.demo.model.Comanda;
import com.example.demo.repository.FacturaRepository;
import com.example.demo.service.FacturaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturi")
public class FacturaController {

    private final FacturaRepository facturaRepository;
    private final FacturaService facturaService;

    public FacturaController(FacturaRepository facturaRepository, FacturaService facturaService) {
        this.facturaRepository = facturaRepository;
        this.facturaService = facturaService;
    }

    @GetMapping
    public List<Factura> getAllFacturi() {
        return facturaRepository.findAll();
    }

    @GetMapping("/email/{email}")
    public List<Factura> getFacturiByEmail(@PathVariable String email) {
        return facturaRepository.findByEmail(email);
    }

    @PostMapping("/generate")
    public ResponseEntity<String> genereazaFactura(@RequestBody Comanda comanda) {
        try {
            facturaService.trimiteFactura(comanda);
            return ResponseEntity.ok("✅ Factura a fost generată și trimisă cu succes!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Eroare: " + e.getMessage());
        }
    }
}

