import type { Kpi, KpiEntry, KpiStatus } from "./types";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function sortedEntries(kpi: Kpi): KpiEntry[] {
  return [...kpi.entries].sort((a, b) => a.date.localeCompare(b.date));
}

export function latestEntry(kpi: Kpi): KpiEntry | undefined {
  const s = sortedEntries(kpi);
  return s[s.length - 1];
}

/**
 * Progress toward target as a ratio (1 = target met).
 * For "decrease" KPIs (lower is better) the ratio is inverted.
 */
export function getProgress(kpi: Kpi): number | null {
  const latest = latestEntry(kpi);
  if (!latest) return null;
  if (kpi.direction === "increase") {
    if (kpi.target === 0) return 1;
    return Math.max(0, latest.value / kpi.target);
  }
  if (latest.value <= 0) return 1;
  return Math.max(0, kpi.target / latest.value);
}

export function getStatus(kpi: Kpi): KpiStatus {
  const p = getProgress(kpi);
  if (p === null) return "no-data";
  if (p >= 0.95) return "on-track";
  if (p >= 0.8) return "at-risk";
  return "off-track";
}

export interface Trend {
  delta: number;
  percent: number | null;
  isGood: boolean;
}

/** Change between the last two entries. */
export function getTrend(kpi: Kpi): Trend | null {
  const s = sortedEntries(kpi);
  if (s.length < 2) return null;
  const last = s[s.length - 1].value;
  const prev = s[s.length - 2].value;
  const delta = last - prev;
  const percent = prev === 0 ? null : (delta / Math.abs(prev)) * 100;
  const isGood = kpi.direction === "increase" ? delta >= 0 : delta <= 0;
  return { delta, percent, isGood };
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: Math.abs(value) >= 1000 ? 0 : 2,
  });
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatValue(value: number, unit: string): string {
  const num = formatNumber(value);
  if (!unit) return num;
  if (unit === "$") return value < 0 ? `-$${formatNumber(-value)}` : `$${num}`;
  if (unit === "%" || unit.startsWith("/")) return `${num}${unit}`;
  return `${num} ${unit}`;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
