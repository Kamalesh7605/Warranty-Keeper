import type { WarrantyPeriodUnit } from '../types/product';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Purchase date + period, matching the backend (java.time plusMonths/plusYears):
 * when the target month is shorter the day is clamped to the month end.
 * Returns '' when the inputs are incomplete.
 */
export function calculateExpiry(purchaseDate: string, period: string, unit: WarrantyPeriodUnit): string {
  const n = Number(period);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate) || !period.trim() || !Number.isInteger(n) || n <= 0) {
    return '';
  }
  const [y, m, d] = purchaseDate.split('-').map(Number);
  const totalMonths = y * 12 + (m - 1) + (unit === 'YEARS' ? n * 12 : n);
  const year = Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${pad(month)}-${pad(Math.min(d, lastDay))}`;
}
