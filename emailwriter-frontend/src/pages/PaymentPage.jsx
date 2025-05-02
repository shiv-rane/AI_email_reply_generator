// PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const PaymentPage = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => navigate('/'), 2500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!stripe || !elements) {
        setError('Stripe or Elements is not properly initialized.');
        setLoading(false);
        return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
        setError('Card information is not entered or CardElement is not mounted.');
        setLoading(false);
        return;
    }

    try {
        console.log("Creating PaymentMethod...");
        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        console.log("Stripe Response:", { stripeError, paymentMethod });

        if (stripeError) {
            console.error("Stripe Error:", stripeError);
            setError(stripeError.message);
            setLoading(false);
            return;
        }

        if (!paymentMethod || !paymentMethod.id) {
            console.error("PaymentMethod ID is missing or empty!");
            setError("Failed to create payment method. Please try again.");
            setLoading(false);
            return;
        }

        console.log("PaymentMethod created successfully:", paymentMethod);

        const token = localStorage.getItem('token'); // Your JWT token

        console.log("Sending to backend:", { 
            paymentMethodId: paymentMethod.id, 
            amount: 999, 
            currency: 'usd' 
        });

        const { data } = await axios.post(
            'http://localhost:8080/api/payments/create-payment-intent',
            { 
                amount: 999, 
                currency: 'usd', 
                paymentMethodId: paymentMethod.id // Include paymentMethodId in the request payload
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const clientSecret = data.clientSecret;

        if (!clientSecret) {
            console.error("Client Secret not received from the backend.");
            setError('Failed to retrieve payment intent. Please try again.');
            setLoading(false);
            return;
        }

        console.log("ClientSecret received:", clientSecret);

        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: paymentMethod.id,
        });

        if (confirmError) {
            console.error("Error confirming payment:", confirmError);
            setError(confirmError.message);
            setLoading(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          alert('Payment Successful!');
          navigate('/');  // Redirect to the homepage after payment success
      } else {
          console.error("PaymentIntent was not successful. Status:", paymentIntent.status);
          setError('Payment was not successful. Please try again.');
      }
    } catch (err) {
        console.error("An error occurred during payment processing:", err);
        setError(err.response?.data?.error || err.message || 'Payment failed. Please try again.');
    } finally {
        setLoading(false);
    }
};


  return (
    <Container>
      <BrandSection>
        <BrandContent>
          <BrandHeading>Upgrade to Premium</BrandHeading>
          <BrandSubtext>
            Get unlimited email generations and premium features
          </BrandSubtext>
        </BrandContent>
      </BrandSection>

      <PaymentSection>
        <PaymentForm>
          <FormTitle>Payment Details</FormTitle>
          
          <PlanCard>
            <PlanName>Premium Plan</PlanName>
            <PlanPrice>$9.99<span>/month</span></PlanPrice>
            <FeaturesList>
              <li>✓ Unlimited email generations</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
            </FeaturesList>
          </PlanCard>

          <Form onSubmit={handleSubmit}>
            <CardSection>
              <CardLabel>Credit Card Information</CardLabel>
              <CardElementWrapper>
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#1a202c',
                        '::placeholder': {
                          color: '#a0aec0',
                        },
                      },
                    },
                  }}
                />
              </CardElementWrapper>
            </CardSection>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SubmitButton disabled={!stripe || loading}>
              {loading ? 'Processing...' : 'Subscribe Now'}
            </SubmitButton>

            <SecurityNote>
              🔒 Secure SSL encryption & PCI compliant payments
            </SecurityNote>
          </Form>
        </PaymentForm>
      </PaymentSection>

      {showSuccess && (
        <SuccessOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SuccessPopup
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <Checkmark viewBox="0 0 52 52">
              <Circle cx="26" cy="26" r="25" fill="none"/>
              <Check fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </Checkmark>
            <SuccessText>Payment Successful!</SuccessText>
            <RedirectText>Redirecting to dashboard...</RedirectText>
          </SuccessPopup>
        </SuccessOverlay>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`;

const BrandSection = styled.div`
  flex: 1;
  background: #1a1d23;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  @media (max-width: 768px) {
    display: none;
  }
`;

const BrandContent = styled.div`
  max-width: 480px;
  margin: 0 auto;
`;

const BrandHeading = styled.h1`
  color: #fff;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
`;

const BrandSubtext = styled.p`
  color: #a0aec0;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const PaymentSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const PaymentForm = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #1a202c;
  text-align: center;
`;

const PlanCard = styled.div`
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  color: #1a202c;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const PlanPrice = styled.div`
  font-size: 2rem;
  color: #2563eb;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
  span {
    font-size: 1rem;
    color: #718096;
    margin-left: 0.5rem;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  li {
    padding: 0.5rem 0;
    color: #4a5568;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CardSection = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
`;

const CardLabel = styled.div`
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const CardElementWrapper = styled.div`
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #1d4ed8;
  }
  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const SecurityNote = styled.div`
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  text-align: center;
  font-size: 0.875rem;
  padding: 0.5rem;
  background: #fff5f5;
  border-radius: 4px;
`;

// Success overlay styles remain same as previous version

export default PaymentPage;