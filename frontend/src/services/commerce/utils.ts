export function parseMadPrice(raw: string): number {
  const cleaned = raw.replace(/[^\d,.-]/g, '').replace(',', '.');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMad(value: number): string {
  return `${new Intl.NumberFormat('fr-MA').format(value)} MAD`;
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
