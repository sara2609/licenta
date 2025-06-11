package com.example.demo.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    public PaymentService(@Value("${stripe.secret.key}") String secretKey) {
        Stripe.apiKey = secretKey;
    }

    public Map<String, String> createPaymentIntent(long amount, Integer months) throws StripeException {
        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(amount * 100)  // Stripe cere suma în cenți
                        .setCurrency("usd")
                        .addPaymentMethodType("card")
                        .build();

        PaymentIntent intent = PaymentIntent.create(params);
        String secret = intent.getClientSecret();

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("❌ ClientSecret nu a fost generat de Stripe.");
        }

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", secret);

        if (months != null && months > 1) {
            double monthly = (double) amount / months;
            response.put("monthlyAmount", String.format("%.2f", monthly));
        }

        return response;
    }

}
