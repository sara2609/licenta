package com.example.demo.controller;

import com.example.demo.Categorie;
import com.example.demo.Product;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final String uploadDir;

    public ProductController(ProductRepository productRepository, EmailService emailService) {
        this.productRepository = productRepository;
        this.emailService = emailService;
        this.uploadDir = System.getProperty("user.home") + "/uploads";
        new File(uploadDir).mkdirs();
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produsul nu a fost găsit"));
    }

    @PostMapping(path = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createProduct(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam String categorie,
            @RequestParam int stock,
            @RequestParam(required = false) String details,
            @RequestParam(required = false) MultipartFile image) throws IOException {

        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setCategorie(Categorie.valueOf(categorie.toUpperCase()));
        product.setStock(stock);
        product.setDetails(details);

        if (image != null && !image.isEmpty()) {
            String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            File dest = new File(uploadDir, filename);
            dest.getParentFile().mkdirs();
            image.transferTo(dest);
            product.setImageUrl("/uploads/" + filename);
        }

        productRepository.save(product);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product updatedProduct) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produsul nu există"));
        existing.setName(updatedProduct.getName());
        existing.setPrice(updatedProduct.getPrice());
        existing.setDescription(updatedProduct.getDescription());
        existing.setCategorie(updatedProduct.getCategorie());
        existing.setStock(updatedProduct.getStock());
        existing.setDetails(updatedProduct.getDetails());
        return productRepository.save(existing);
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestParam int stock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produsul nu există"));

        int newStock = product.getStock() + stock;
        product.setStock(newStock);
        productRepository.save(product);

        // Trimite email dacă stocul e critic (<= 5)
        if (newStock <= 5) {
            try {
                emailService.trimiteEmailSimplu(
                        "stefan.emil.cocolos@gmail.com",
                        "⚠️ ALERTĂ STOC CRITIC - " + product.getName(),
                        "<h3>Produsul <strong>" + product.getName() + "</strong> are stoc scăzut: <strong>" + newStock + "</strong> bucăți.</h3>"
                );
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }

        return ResponseEntity.ok("✅ Stoc actualizat cu succes!");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public void deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<Product> produseCuStocScazut() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStock() <= 5)
                .collect(Collectors.toList());
    }
}
