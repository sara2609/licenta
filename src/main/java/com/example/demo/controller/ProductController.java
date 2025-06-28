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
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final String uploadDir;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

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

    @GetMapping(params = "categorie")
    public List<Product> getByCategorie(@RequestParam String categorie) {
        try {
            return productRepository.findByCategorie(Categorie.valueOf(categorie.toUpperCase()));
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    @GetMapping("/sort/review")
    public List<Product> sortByReviewScoreDesc() {
        return productRepository.findAllByOrderByReviewScoreDesc();
    }


    @GetMapping("/sort/sold")
    public List<Product> sortBySoldDesc() {
        return productRepository.findAllByOrderBySoldDesc();
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
            @RequestParam(required = false) MultipartFile image
    ) throws IOException {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setInitialPrice(price);
        product.setCategorie(Categorie.valueOf(categorie.toUpperCase()));
        product.setStock(stock);
        product.setDetails(details);

        if (image != null && !image.isEmpty()) {
            String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            File dest = new File(uploadDir, filename);
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
        existing.setInitialPrice(updatedProduct.getInitialPrice());
        existing.setDescription(updatedProduct.getDescription());
        existing.setCategorie(updatedProduct.getCategorie());
        existing.setStock(updatedProduct.getStock());
        existing.setDetails(updatedProduct.getDetails());
        return productRepository.save(existing);
    }

    @PutMapping("/{id}/discount")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> applyDiscount(
            @PathVariable Long id,
            @RequestParam(required = false) Double procent,
            @RequestParam(required = false) Double suma,
            @RequestParam(required = false) Integer duration
    ) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produsul nu există"));

        if (product.getInitialPrice() == null) {
            product.setInitialPrice(product.getPrice());
        }

        if (procent != null && procent > 0) {
            double newPrice = product.getPrice() - (product.getPrice() * procent / 100.0);
            product.setPrice(Math.max(newPrice, 0));
        } else if (suma != null && suma > 0) {
            product.setPrice(Math.max(product.getPrice() - suma, 0));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Trebuie să specifici procentul sau suma."));
        }

        productRepository.save(product);

        if (duration != null && duration > 0) {
            scheduler.schedule(() -> {
                Product p = productRepository.findById(id).orElse(null);
                if (p != null && p.getInitialPrice() != null) {
                    p.setPrice(p.getInitialPrice());
                    productRepository.save(p);
                }
            }, duration, TimeUnit.SECONDS);
        }

        return ResponseEntity.ok(Map.of("message", "Reducere aplicată cu succes"));
    }

    @PutMapping("/{id}/restore-price")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> restoreInitialPrice(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produsul nu există"));

        if (product.getInitialPrice() != null) {
            product.setPrice(product.getInitialPrice());
            productRepository.save(product);
            return ResponseEntity.ok(Map.of("message", "✅ Prețul inițial a fost restaurat."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "❌ Nu există preț inițial salvat pentru acest produs."));
        }
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<Product> produseCuStocScazut() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStock() <= 5)
                .collect(Collectors.toList());
    }

    @GetMapping("/in-stock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<Product> getProductsInStock() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStock() > 0)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestParam int stock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produsul nu există"));
        product.setStock(product.getStock() + stock);
        productRepository.save(product);
        return ResponseEntity.ok("✅ Stoc actualizat cu succes!");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public void deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
    }
}
