const PALETTE: [string, string][] = [
  ['#3b82f6', '#1d4ed8'], ['#8b5cf6', '#6d28d9'], ['#06b6d4', '#0e7490'], ['#10b981', '#047857'],
  ['#f59e0b', '#b45309'], ['#ec4899', '#be185d'], ['#6366f1', '#4338ca'], ['#14b8a6', '#0f766e'],
];

/** Stable gradient per name so each product keeps the same avatar colour. */
export function avatarGradient(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = PALETTE[hash % PALETTE.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
