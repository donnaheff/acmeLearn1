// Pure currency helpers safe to import from both Server and Client
// Components. getDisplayCurrency() (which needs next/headers) lives in
// lib/currency.ts instead, since that import would break in a client bundle.

export type DisplayCurrency = 'NGN' | 'GHS' | 'USD';

// Single source for the 1:1 coaching session rate, shown on both
// /marketplace and /meet-your-tutor.
export const COACHING_SESSION_MINOR_NGN = 1_800_000;

// Approximate, used only if the live rate fetch below fails — display
// purposes only, never used to actually charge anyone.
const FALLBACK_RATES_FROM_NGN: Record<DisplayCurrency, number> = {
  NGN: 1,
  GHS: 0.0095,
  USD: 0.00063,
};

async function getRatesFromNgn(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/NGN', { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('rate fetch failed');
    const data = await res.json();
    if (!data?.rates) throw new Error('no rates in response');
    return data.rates;
  } catch {
    return FALLBACK_RATES_FROM_NGN;
  }
}

// amountMinor is in kobo (1/100 NGN), matching products.amount_minor.
export async function convertFromNgnMinor(amountMinor: number, target: DisplayCurrency): Promise<number> {
  if (target === 'NGN') return amountMinor;
  const rates = await getRatesFromNgn();
  const rate = rates[target] ?? FALLBACK_RATES_FROM_NGN[target];
  return Math.round(amountMinor * rate);
}

// Generic 'en' falls back to the ISO code ("NGN 19,000") for currencies
// without a symbol registered in that locale's CLDR data — each currency
// needs its own regional locale to render its actual symbol (₦, GH₵, $).
const LOCALE_BY_CURRENCY: Record<string, string> = { NGN: 'en-NG', GHS: 'en-GH', USD: 'en-US' };

export function formatMoney(amountMinor: number, currency: string) {
  try {
    return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency] || 'en', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'NGN' ? 0 : 2,
    }).format(amountMinor / 100);
  } catch {
    return `${currency} ${(amountMinor / 100).toFixed(2)}`;
  }
}
