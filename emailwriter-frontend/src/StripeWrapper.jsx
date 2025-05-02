// StripeWrapper.jsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51R7bQF4W1uLZ1AIAksKKDoRWNUcMf9Kh5wFepxbi4eyTI8Sz9iFnpDOLdtrBPvK7SO1ethplB6BT2vLo2sSa807d004w5hZcs2');

export default function StripeWrapper({ children }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}