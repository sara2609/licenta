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

    public Map<String, String> createPaymentIntent(long amount) throws StripeException {
        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(amount * 100)  // Stripe folosește cenți, deci trebuie să multiplici suma
                        .setCurrency("usd")
                        .addPaymentMethodType("card") // ✅ SOLUȚIA CORECTĂ!
                        .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", intent.getClientSecret());
        return response;
    }
}
