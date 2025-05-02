package com.project.emailwriter.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    public PaymentService(@Value("${stripe.secret.key}") String secretKey) {Stripe.apiKey = secretKey;}

    public PaymentIntent createPaymentIntent(Long amount, String currency, String paymentMethodId) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .setPaymentMethod(paymentMethodId)
                .setConfirmationMethod(PaymentIntentCreateParams.ConfirmationMethod.MANUAL)
                .setConfirm(true)
                .build();
        return PaymentIntent.create(params);
    }
}
