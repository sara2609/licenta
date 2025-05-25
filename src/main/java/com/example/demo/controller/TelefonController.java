package com.example.demo.controller;

import com.example.demo.Telefon;
import com.example.demo.repository.TelefonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/telefoane")
public class TelefonController {

    @Autowired
    private TelefonRepository telefonRepository;

    @GetMapping
    public List<Telefon> getAllTelefoane() {
        return telefonRepository.findAll();
    }

    @PostMapping
    public Telefon addTelefon(@RequestBody Telefon telefon) {
        return telefonRepository.save(telefon);
    }
}
