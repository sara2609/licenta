package com.example.demo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacturaDTO {
    private Long id;
    private String orderId;
    private String clientName;
    private String email;
    private String total;
    private String filePath;
    private LocalDateTime dataEmitere;
    private String rateSummary;
}
