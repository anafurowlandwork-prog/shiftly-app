/**
 * Shiftly Stripe Payments & Driver Payout Engine
 * Handles customer checkout (Apple Pay / Google Pay / Cards), tip calculations,
 * and Stripe Connect Express instant driver payouts.
 */

export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51ShiftlyMovingLogisticsPlatformKey2026',
  platformFeeRate: 0.20, // 20% Shiftly platform fee
  driverEarningsRate: 0.80, // 80% to driver partner
  stripeProcessingFee: 0.029, // 2.9% + 30c
  stripeFixedFee: 0.30
};

/**
 * Calculates complete move pricing and earnings split
 */
export function calculateMovePricing({
  vehicleTier,
  distanceMiles = 14,
  helpersCount = 2,
  hasViaStop = false,
  accessType = 'Elevator Building',
  addOns = { packing: false, disassembly: false, fragileInsurance: false },
  promoDiscount = 0,
  tipPercentage = 15 // 0, 10, 15, 20, 25 or custom amount
}) {
  const basePrice = vehicleTier?.basePrice || 75;
  const perMile = vehicleTier?.perMile || 2.40;
  
  const distanceFare = Number((perMile * distanceMiles).toFixed(2));
  const helperFee = helpersCount > 1 ? (helpersCount - 1) * 35 : 0;
  const stopFee = hasViaStop ? 25 : 0;
  const stairFee = accessType === 'Stairs (3rd Floor+)' ? 30 : accessType === 'Stairs (2nd Floor)' ? 15 : 0;
  
  const addOnsTotal = 
    (addOns.packing ? 25 : 0) + 
    (addOns.disassembly ? 40 : 0) + 
    (addOns.fragileInsurance ? 20 : 0);

  const subtotal = basePrice + distanceFare + helperFee + stopFee + stairFee + addOnsTotal;
  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);

  // Tip calculation
  let tipAmount = 0;
  if (typeof tipPercentage === 'number') {
    tipAmount = Number(((discountedSubtotal * tipPercentage) / 100).toFixed(2));
  } else {
    tipAmount = Number(tipPercentage) || 0;
  }

  const grandTotal = Number((discountedSubtotal + tipAmount).toFixed(2));

  // Driver Payout Breakdown (Stripe Connect Express)
  // Driver gets: 80% of subtotal + 100% of all customer tips
  const driverBasePayout = Number((discountedSubtotal * STRIPE_CONFIG.driverEarningsRate).toFixed(2));
  const driverTotalPayout = Number((driverBasePayout + tipAmount).toFixed(2));
  const platformRevenue = Number((discountedSubtotal * STRIPE_CONFIG.platformFeeRate).toFixed(2));

  return {
    basePrice,
    distanceFare,
    helperFee,
    stopFee,
    stairFee,
    addOnsTotal,
    subtotal: Number(subtotal.toFixed(2)),
    promoDiscount,
    discountedSubtotal: Number(discountedSubtotal.toFixed(2)),
    tipAmount,
    grandTotal,
    driverPayout: {
      baseEarnings: driverBasePayout,
      tipEarnings: tipAmount,
      totalPayout: driverTotalPayout
    },
    platformRevenue
  };
}

/**
 * Simulates Stripe Payment Processing with Biometrics / 3D Secure
 */
export async function processStripePayment({
  amount,
  paymentMethod = 'applepay',
  customerEmail = 'customer@shiftly.com',
  bookingId
}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `ch_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`,
        amount,
        currency: 'USD',
        status: 'succeeded',
        paymentMethodType: paymentMethod,
        receiptUrl: `https://pay.stripe.com/receipts/shiftly-${bookingId}`,
        timestamp: new Date().toISOString()
      });
    }, 1200);
  });
}

/**
 * Initiates Instant Payout for Driver via Stripe Connect Express
 */
export async function executeDriverInstantPayout({
  driverId = 'DRV-9921',
  amount,
  payoutMethod = 'debit_card_instant'
}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        payoutId: `po_${Math.random().toString(36).substring(2, 14)}`,
        amount,
        currency: 'USD',
        arrivalDate: 'Instant (1-2 minutes)',
        destinationAccount: 'Chase Debit •••• 4192',
        fee: 0.50,
        netPayout: Number((amount - 0.50).toFixed(2)),
        status: 'PAID'
      });
    }, 1500);
  });
}
