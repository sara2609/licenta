package com.example.demo.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/api/invoice")
public class InvoiceController {

    @GetMapping("/view/{orderId}")
    public ResponseEntity<FileSystemResource> viewInvoice(@PathVariable String orderId) {
        String fileName = "factura_" + orderId + ".pdf";
        File file = new File(fileName);

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + fileName);
        headers.add(HttpHeaders.CONTENT_TYPE, "application/pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(new FileSystemResource(file));
    }
}
