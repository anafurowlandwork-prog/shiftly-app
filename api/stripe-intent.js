/**
 * Vercel Serverless Function: Stripe Payment Intent Creation
 * Creates real Stripe Payment Intents with Apple Pay / Google Pay / Card support.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount, currency = 'usd', bookingId, customerEmail } = req.body || {};

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey) {
      // Real Stripe integration via standard Stripe REST API (Zero external dependencies)
      const params = new URLSearchParams();
      params.append('amount', Math.round(Number(amount) * 100).toString());
      params.append('currency', currency);
      params.append('automatic_payment_methods[enabled]', 'true');
      if (bookingId) params.append('metadata[bookingId]', bookingId);
      if (customerEmail) params.append('metadata[customerEmail]', customerEmail);

      const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const paymentIntent = await stripeRes.json();
      if (!stripeRes.ok) {
        throw new Error(paymentIntent.error?.message || 'Failed to create payment intent');
      }

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        amount: paymentIntent.amount
      });
    } else {
      // High-fidelity sandbox simulated response
      return res.status(200).json({
        clientSecret: `pi_${Math.random().toString(36).substring(2, 12)}_secret_${Math.random().toString(36).substring(2, 10)}`,
        id: `pi_${Math.random().toString(36).substring(2, 14)}`,
        amount: Math.round(Number(amount) * 100),
        status: 'requires_payment_method',
        sandbox: true
      });
    }
  } catch (error) {
    console.error('Stripe Intent Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
