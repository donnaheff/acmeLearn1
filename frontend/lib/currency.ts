import { cookies } from 'next/headers';

export type { DisplayCurrency } from './money';
export { convertFromNgnMinor, formatMoney, COACHING_SESSION_MINOR_NGN } from './money';

import type { DisplayCurrency } from './money';

export async function getDisplayCurrency(): Promise<DisplayCurrency> {
  const store = await cookies();
  const value = store.get('acme_currency')?.value;
  return value === 'GHS' || value === 'USD' ? value : 'NGN';
}
