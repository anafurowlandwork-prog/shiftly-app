/**
 * Shiftly Global Currency & International Localization Engine
 * Supports automatic currency detection based on country calling codes.
 */

export const CURRENCY_CONFIGS = {
  '+44': {
    country: 'United Kingdom',
    currencyCode: 'GBP',
    symbol: '£',
    rateMultiplier: 0.80, // £0.80 = $1.00 USD
    minPhoneDigits: 10,
    maxPhoneDigits: 11,
    examplePhone: '7911 123456'
  },
  '+1': {
    country: 'United States / Canada',
    currencyCode: 'USD',
    symbol: '$',
    rateMultiplier: 1.00, // Standard base
    minPhoneDigits: 10,
    maxPhoneDigits: 10,
    examplePhone: '(555) 000-0000'
  },
  '+33': {
    country: 'France',
    currencyCode: 'EUR',
    symbol: '€',
    rateMultiplier: 0.92,
    minPhoneDigits: 9,
    maxPhoneDigits: 10,
    examplePhone: '6 12 34 56 78'
  },
  '+49': {
    country: 'Germany',
    currencyCode: 'EUR',
    symbol: '€',
    rateMultiplier: 0.92,
    minPhoneDigits: 10,
    maxPhoneDigits: 11,
    examplePhone: '151 12345678'
  },
  '+353': {
    country: 'Ireland',
    currencyCode: 'EUR',
    symbol: '€',
    rateMultiplier: 0.92,
    minPhoneDigits: 9,
    maxPhoneDigits: 10,
    examplePhone: '85 123 4567'
  },
  '+233': {
    country: 'Ghana',
    currencyCode: 'GHS',
    symbol: 'GH₵',
    rateMultiplier: 15.50, // GH₵15.50 = $1.00 USD
    minPhoneDigits: 9,
    maxPhoneDigits: 10,
    examplePhone: '24 123 4567'
  },
  '+234': {
    country: 'Nigeria',
    currencyCode: 'NGN',
    symbol: '₦',
    rateMultiplier: 1500.00, // ₦1500 = $1.00 USD
    minPhoneDigits: 10,
    maxPhoneDigits: 11,
    examplePhone: '801 234 5678'
  },
  '+254': {
    country: 'Kenya',
    currencyCode: 'KES',
    symbol: 'KSh',
    rateMultiplier: 130.00,
    minPhoneDigits: 9,
    maxPhoneDigits: 10,
    examplePhone: '712 345678'
  },
  '+27': {
    country: 'South Africa',
    currencyCode: 'ZAR',
    symbol: 'R',
    rateMultiplier: 18.20,
    minPhoneDigits: 9,
    maxPhoneDigits: 10,
    examplePhone: '82 123 4567'
  },
  '+61': {
    country: 'Australia',
    currencyCode: 'AUD',
    symbol: 'A$',
    rateMultiplier: 1.52,
    minPhoneDigits: 9,
    maxPhoneDigits: 10,
    examplePhone: '412 345 678'
  },
  '+971': {
    country: 'United Arab Emirates',
    currencyCode: 'AED',
    symbol: 'AED ',
    rateMultiplier: 3.67,
    minPhoneDigits: 9,
    maxPhoneDigits: 10,
    examplePhone: '50 123 4567'
  },
  '+91': {
    country: 'India',
    currencyCode: 'INR',
    symbol: '₹',
    rateMultiplier: 84.00,
    minPhoneDigits: 10,
    maxPhoneDigits: 10,
    examplePhone: '98765 43210'
  },
  '+52': {
    country: 'Mexico',
    currencyCode: 'MXN',
    symbol: 'Mex$',
    rateMultiplier: 19.50,
    minPhoneDigits: 10,
    maxPhoneDigits: 10,
    examplePhone: '55 1234 5678'
  },
  '+55': {
    country: 'Brazil',
    currencyCode: 'BRL',
    symbol: 'R$',
    rateMultiplier: 5.40,
    minPhoneDigits: 10,
    maxPhoneDigits: 11,
    examplePhone: '11 91234-5678'
  }
};

/**
 * Get active currency configuration from phone country code or stored preference.
 */
export function getCurrencyForCountryCode(countryCode = '+44') {
  return CURRENCY_CONFIGS[countryCode] || CURRENCY_CONFIGS['+44'];
}

/**
 * Convert base USD price to the target currency and format with symbol.
 */
export function formatCurrencyPrice(baseUsdAmount, countryCode = '+44', showDecimals = true) {
  const config = getCurrencyForCountryCode(countryCode);
  const converted = baseUsdAmount * config.rateMultiplier;

  // High integer currencies (NGN, KES, INR, GHS) look cleaner with whole numbers or standard decimals
  let formattedNumber;
  if (config.rateMultiplier >= 100) {
    formattedNumber = Math.round(converted).toLocaleString();
  } else if (!showDecimals) {
    formattedNumber = Math.round(converted).toLocaleString();
  } else {
    formattedNumber = converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return `${config.symbol}${formattedNumber}`;
}

/**
 * Generate Google Calendar Add URL
 */
export function generateGoogleCalendarUrl({ title, description, location, startDate, endDate }) {
  const startStr = startDate ? new Date(startDate).toISOString().replace(/-|:|\.\d\d\d/g, '') : '';
  const endStr = endDate ? new Date(endDate).toISOString().replace(/-|:|\.\d\d\d/g, '') : '';
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Shiftly Move Booking',
    details: description || 'Shiftly on-demand mover booking dispatch',
    location: location || 'Pickup Location',
    dates: `${startStr}/${endStr}`
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate .ics file content for Apple / Outlook Calendar
 */
export function generateIcsCalendarFile({ title, description, location, dateStr, bookingId }) {
  const now = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '');
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Shiftly Logistics//Move Reminder//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${bookingId || 'SHFT-MOVE'}@shiftly.com
DTSTAMP:${now}
DTSTART:${now}
DTEND:${now}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

/**
 * Shiftly Shield™ Cargo Insurance & Protection Tier Definitions
 */
export const SHIELD_TIERS = {
  BASIC: {
    id: 'BASIC',
    name: 'Basic Carrier Liability',
    tag: 'Included Free',
    feeUsd: 0,
    coverageLimitUsd: 10000,
    deductibleUsd: 250,
    resolutionTime: '5-7 business days',
    features: [
      'Standard carrier transit protection ($0.60/lb)',
      'Basic damaged item claims assistance',
      '$250 Standard Deductible'
    ]
  },
  COMPREHENSIVE: {
    id: 'COMPREHENSIVE',
    name: 'Shiftly Shield™ Comprehensive',
    tag: 'Most Popular (Recommended)',
    feeUsd: 29,
    coverageLimitUsd: 50000,
    deductibleUsd: 0,
    resolutionTime: '48-hour priority payout',
    recommended: true,
    features: [
      'Full Replacement Value Protection (up to $50k)',
      '$0 Zero Deductible Guaranteed',
      'Accidental scratches, dings, glass & TV panel coverage',
      '48-Hour Rapid Claim Concierge with direct bank transfer',
      'Certified high-density furniture blanket wrapping'
    ]
  },
  ULTRA: {
    id: 'ULTRA',
    name: 'Shiftly Shield™ Ultra & Fine Art',
    tag: 'High-Value & Luxury',
    feeUsd: 59,
    coverageLimitUsd: 100000,
    deductibleUsd: 0,
    resolutionTime: '24-hour express resolution',
    features: [
      'Comprehensive High-Value Protection (up to $100k)',
      '$0 Zero Deductible Guaranteed',
      'Pianos, fine art, antiques & designer furniture coverage',
      'Custom wooden crating & moisture-barrier sealing',
      '24-Hour dedicated senior claims concierge manager',
      'Worldwide underwriter backing certificate'
    ]
  }
};

