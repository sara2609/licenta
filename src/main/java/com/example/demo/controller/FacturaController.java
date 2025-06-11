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
    public ResponseEntity<List<FacturaDTO>> getFacturiByEmail(@PathVariable String email) {
        List<Factura> facturi = facturaRepository.findByEmail(email);

        List<FacturaDTO> rezultat = facturi.stream().map(factura -> {
            String rateSummary = facturaService.getRateSummaryForOrder(factura.getOrderId());

            return FacturaDTO.builder()
                    .id(factura.getId())
                    .orderId(factura.getOrderId())
                    .clientName(factura.getClientName())
                    .email(factura.getEmail())
                    .total(factura.getTotal())
                    .filePath(factura.getFilePath())
                    .dataEmitere(factura.getDataEmitere())
                    .rateSummary(rateSummary)
                    .build();
        }).toList();

        return ResponseEntity.ok(rezultat);
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
