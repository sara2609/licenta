package com.example.demo.config;

import com.example.demo.security.JwtRequestFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/auth/login",
                                "/auth/register",
                                "/auth/confirm/**",
                                "/auth/forgot-password",
                                "/auth/reset-password",
                                "/uploads/**",
                                "/api/invoice/view/**",
                                "/api/facturi/generate",
                                "/api/returns",
                                "/payment/**"
                        ).permitAll()


                        .requestMatchers(HttpMethod.GET, "/api/facturi/email/**")
                        .hasAnyRole("USER","ADMIN")

                        .requestMatchers("/installments/create").authenticated()

                        .requestMatchers(HttpMethod.GET,
                                "/products",
                                "/products/{id}",
                                "/products/low-stock",
                                "/products/sort/review",
                                "/products/sort/sold",
                                "/products?categorie=**"
                        ).permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/returns/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/returns/*/status").hasRole("ADMIN")

                        .requestMatchers("/products/add", "/products/{id}", "/products/{id}/stock",
                                "/products/delete/**").hasRole("ADMIN")

                        .requestMatchers("/reviews/product/**").permitAll()
                        .requestMatchers("/reviews/user","/reviews/add").authenticated()

                        .requestMatchers("/api/rewards/status","/api/rewards/claim","/api/rewards/points").hasRole("USER")
                        .requestMatchers("/api/rewards/history").hasRole("USER")
                        .requestMatchers("/admin/reward-history").hasRole("ADMIN")

                        .requestMatchers("/fidelity/**").authenticated()
                        .requestMatchers("/messages/all","/messages/reply/**","/admin/**").hasRole("ADMIN")
                        .requestMatchers("/wishlist/**","/cart/**").authenticated()
                        .requestMatchers("/messages/send").authenticated()

                        .requestMatchers("/api/matching-price/create").hasAnyRole("USER","ADMIN")
                        .requestMatchers("/api/matching-price/user/**").hasAnyRole("USER","ADMIN")
                        .requestMatchers(
                                "/api/matching-price/approve/**",
                                "/api/matching-price/reject/**",
                                "/api/matching-price/pending"
                        ).hasRole("ADMIN")
                        .requestMatchers("/api/matching-price/generate-token/**").hasRole("ADMIN")


                        .anyRequest().authenticated()
                )
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:3000"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
