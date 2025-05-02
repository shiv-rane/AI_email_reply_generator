package com.project.emailwriter.controller;

import com.project.emailwriter.model.User;
import com.project.emailwriter.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Object> paymentData, HttpServletRequest request) {
        Stripe.apiKey = stripeSecretKey;

        // Log received request data
        System.out.println("Received payment data: " + paymentData);

        try {
            String paymentMethodId = (String) paymentData.get("paymentMethodId");
            int amount = (Integer) paymentData.get("amount");
            String currency = (String) paymentData.get("currency");

            // Log extracted values
            System.out.println("Extracted paymentMethodId: " + paymentMethodId);
            System.out.println("Extracted amount: " + amount);
            System.out.println("Extracted currency: " + currency);

            // Validate amount and currency
            if (amount <= 0 || currency == null || currency.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount or currency"));
            }

            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount((long) amount)
                    .setCurrency(currency)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    );

            if (paymentMethodId != null && !paymentMethodId.trim().isEmpty()) {
                paramsBuilder.setPaymentMethod(paymentMethodId);
            }

            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

            Map<String, String> responseData = new HashMap<>();
            responseData.put("clientSecret", paymentIntent.getClientSecret());


            if ("requires_confirmation".equals(paymentIntent.getStatus())) {
                String email = (String) request.getAttribute("email"); // Extracted from JWT filter

                if (email != null) {
                    User user = userRepository.findByEmail(email).orElse(null);

                    if (user != null) {
                        user.setPremium(true);
                        userRepository.save(user); // Save user status to premium
                        System.out.println("User " + email + " is now premium!");
                    }
                }
            }

            return ResponseEntity.ok(responseData);

        } catch (StripeException e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

}
