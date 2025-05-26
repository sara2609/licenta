package com.example.demo.service;

import com.example.demo.Categorie;
import com.example.demo.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> searchProductsByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> filterProductsByPrice(double minPrice, double maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }

    public List<Product> sortProductsByPrice(String order) {
        Sort sort = order.equalsIgnoreCase("asc") ?
                Sort.by("price").ascending() :
                Sort.by("price").descending();
        return productRepository.findAll(sort);
    }

    public Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("❌ Product not found!"));
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByCategorie(Categorie categorie) {
        return productRepository.findByCategorie(categorie);
    }

    public Product updateStock(Long id, int newStock) {
        Product product = getProductById(id);
        product.setStock(newStock);
        return productRepository.save(product);
    }

    public void decreaseStock(Long productId, int amount) {
        Product product = getProductById(productId);
        if (product.getStock() < amount) {
            throw new RuntimeException("Stoc insuficient");
        }
        product.setStock(product.getStock() - amount);
        productRepository.save(product);
    }

    public void saveProduct(Product product) {
        productRepository.save(product);
    }

    // 🔥 Sortare după reviewScore descrescător
    public List<Product> sortByReviewScoreDesc() {
        return productRepository.findAllByOrderByReviewScoreDesc();
    }
}
