package com.example.demo;

import jakarta.persistence.*;

@Entity
@Table(name = "telefoane")
public class Telefon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String Marca;
    private String Model;
    private double Pret;

    // Getters și setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getMarca() { return Marca; }
    public void setMarca(String Marca) { this.Marca = Marca; }

    public String getModel() { return Model; }
    public void setModel(String Model) { this.Model = Model; }

    public double getPret() { return Pret; }
    public void setPret(double Pret) { this.Pret = Pret; }
}
