// Currency configurations, exchange rates (base INR = 1), and auto-detect logic

export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', label: '₹ INR (Indian Rupee)', rate: 1, country: 'India' },
  USD: { code: 'USD', symbol: '$', label: '$ USD (US Dollar)', rate: 0.012, country: 'United States' },
  EUR: { code: 'EUR', symbol: '€', label: '€ EUR (Euro)', rate: 0.011, country: 'Europe' },
  GBP: { code: 'GBP', symbol: '£', label: '£ GBP (British Pound)', rate: 0.0095, country: 'United Kingdom' },
  AED: { code: 'AED', symbol: 'AED ', label: 'AED (UAE Dirham)', rate: 0.044, country: 'United Arab Emirates' },
  SGD: { code: 'SGD', symbol: 'S$', label: 'S$ SGD (Singapore Dollar)', rate: 0.016, country: 'Singapore' },
  CAD: { code: 'CAD', symbol: 'CA$', label: 'CA$ CAD (Canadian Dollar)', rate: 0.016, country: 'Canada' },
  AUD: { code: 'AUD', symbol: 'A$', label: 'A$ AUD (Australian Dollar)', rate: 0.018, country: 'Australia' }
};

/**
 * Automatically detect user's local currency based on browser timeZone / locale
 */
export function detectLocalCurrency() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const locale = navigator.language || navigator.userLanguage || '';

    // Check timezone hints
    if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('Asia/Colombo') || locale.includes('en-IN') || locale.includes('hi')) {
      return 'INR';
    }
    if (timeZone.includes('New_York') || timeZone.includes('Los_Angeles') || timeZone.includes('Chicago') || timeZone.includes('America') || locale.includes('en-US')) {
      return 'USD';
    }
    if (timeZone.includes('London') || timeZone.includes('Europe/London') || locale.includes('en-GB')) {
      return 'GBP';
    }
    if (timeZone.includes('Paris') || timeZone.includes('Berlin') || timeZone.includes('Rome') || timeZone.includes('Madrid') || timeZone.includes('Europe')) {
      return 'EUR';
    }
    if (timeZone.includes('Dubai') || timeZone.includes('Asia/Dubai')) {
      return 'AED';
    }
    if (timeZone.includes('Singapore') || timeZone.includes('Asia/Singapore')) {
      return 'SGD';
    }
    if (timeZone.includes('Toronto') || timeZone.includes('Vancouver')) {
      return 'CAD';
    }
    if (timeZone.includes('Sydney') || timeZone.includes('Melbourne') || timeZone.includes('Australia')) {
      return 'AUD';
    }
  } catch (e) {
    console.warn('Currency auto-detect error, defaulting to INR', e);
  }
  return 'INR';
}

/**
 * Convert and format price from INR to target currency
 */
export function formatCurrency(amountInINR, currencyCode = 'INR') {
  if (amountInINR === null || amountInINR === undefined) return '';
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const converted = Math.round(amountInINR * curr.rate);
  
  if (currencyCode === 'INR') {
    return `${curr.symbol}${converted.toLocaleString('en-IN')}`;
  }
  return `${curr.symbol}${converted.toLocaleString('en-US')}`;
}
