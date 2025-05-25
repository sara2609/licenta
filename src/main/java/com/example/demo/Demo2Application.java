package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Demo2Application {

    public static void main(String[] args) {
        SpringApplication.run(Demo2Application.class, args);
    }

    @Bean
    public CommandLineRunner testBeans(ApplicationContext ctx) {
        return args -> {
            System.out.println("== LISTING BEANS ==");
            for (String beanName : ctx.getBeanDefinitionNames()) {
                System.out.println(beanName);
            }
        };
    }
}
