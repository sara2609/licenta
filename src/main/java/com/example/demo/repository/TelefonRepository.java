package com.example.demo.repository;

import com.example.demo.Telefon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TelefonRepository extends JpaRepository<Telefon, Long> {

}
