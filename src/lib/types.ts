/** Whether a higher or a lower value is better for this KPI. */
export type Direction = "increase" | "decrease";

export type Frequency = "daily" | "weekly" | "monthly" | "quarterly";

export type KpiStatus = "on-track" | "at-risk" | "off-track" | "no-data";

export interface KpiEntry {
  id: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  value: number;
  note?: string;
}

export interface Kpi {
  id: string;
  name: string;
  description: string;
  category: string;
  /** e.g. "$", "%", "hrs", "leads" */
  unit: string;
  target: number;
  direction: Direction;
  frequency: Frequency;
  owner: string;
  entries: KpiEntry[];
  createdAt: string;
}

/** Fields the user edits through the KPI form. */
export type KpiInput = Omit<Kpi, "id" | "entries" | "createdAt">;

export const CATEGORIES = [
  "Finance",
  "Sales",
  "Marketing",
  "Customer",
  "Operations",
  "People",
  "Engineering",
  "Other",
] as const;

export const FREQUENCIES: Frequency[] = ["daily", "weekly", "monthly", "quarterly"];
