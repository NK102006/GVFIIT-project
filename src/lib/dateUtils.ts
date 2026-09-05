/** Returns the last `count` months as {key, label} buckets, oldest first.
 * key is "YYYY-M" (matches new Date(iso).getFullYear()+'-'+getMonth()), label is short month name.
 */
export function lastMonthBuckets(count: number): { key: string; label: string }[] {
  const buckets: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  return buckets;
}

/** Groups ISO date strings into the given month buckets, returning counts aligned to bucket order. */
export function countByMonth(isoDates: (string | null | undefined)[], buckets: { key: string }[]): number[] {
  const counts: Record<string, number> = {};
  for (const iso of isoDates) {
    if (!iso) continue;
    const d = new Date(iso);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return buckets.map((b) => counts[b.key] || 0);
}

/** Days between now and a future ISO date (negative if already past). */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const diffMs = d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** Lightweight "2 days ago" / "just now" formatter — avoids pulling in date-fns for one helper. */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
