const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

/** Parses a yyyy-MM-dd string as a local date (avoids UTC off-by-one). */
export function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(value: string | null | undefined): string {
  return value ? dateFormatter.format(parseDate(value)) : '—';
}

export function formatPrice(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : currencyFormatter.format(value);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDateTime(value: string): string {
  return dateFormatter.format(new Date(value));
}

/** "Expires Tomorrow" / "Expires in 5 days" / "Expired 3 days ago". */
export function describeExpiry(daysUntilExpiry: number | null): string {
  if (daysUntilExpiry === null) return 'No warranty';
  if (daysUntilExpiry < -1) return `Expired ${-daysUntilExpiry} days ago`;
  if (daysUntilExpiry === -1) return 'Expired yesterday';
  if (daysUntilExpiry === 0) return 'Expires Today';
  if (daysUntilExpiry === 1) return 'Expires Tomorrow';
  return `Expires in ${daysUntilExpiry} days`;
}
