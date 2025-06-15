package com.example.demo.controller;

import com.example.demo.Factura;
import com.example.demo.FacturaDTO;
import com.example.demo.model.Comanda;
import com.example.demo.repository.FacturaRepository;
import com.example.demo.service.FacturaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturi")
@CrossOrigin(origins = "http://localhost:3000")     // ✅ permite frontend-ului
public class FacturaController {

    private final FacturaRepository facturaRepository;
    private final FacturaService   facturaService;

    public FacturaController(FacturaRepository facturaRepository,
                             FacturaService facturaService) {
        this.facturaRepository = facturaRepository;
        this.facturaService    = facturaService;
    }

    /* ---------- Admin sau debugging ---------- */
    @GetMapping
    public List<Factura> getAllFacturi() {
        return facturaRepository.findAll();
    }

    /* ---------- Lista facturi pentru user ---------- */
    @GetMapping("/email/{email}")
    public ResponseEntity<List<FacturaDTO>> getFacturiByEmail(@PathVariable String email) {

        List<FacturaDTO> rezultat = facturaRepository.findByEmail(email).stream()
                .map(f -> {
                    String rate = facturaService.getRateSummaryForOrder(f.getOrderId());
                    return FacturaDTO.builder()
                            .id(f.getId())
                            .orderId(f.getOrderId())
                            .clientName(f.getClientName())
                            .email(f.getEmail())
                            .total(f.getTotal())
                            .filePath(f.getFilePath())
                            .dataEmitere(f.getDataEmitere())
                            .rateSummary(rate)
                            .build();
                })
                .toList();

        return ResponseEntity.ok(rezultat);
    }

    /* ---------- Generare + trimitere imediată ---------- */
    @PostMapping("/generate")
    public ResponseEntity<String> genereazaFactura(@RequestBody Comanda comanda) {
        try {
            facturaService.trimiteFactura(comanda);
            return ResponseEntity.ok("✅ Factura a fost generată și trimisă!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ " + e.getMessage());
        }
    }
}
