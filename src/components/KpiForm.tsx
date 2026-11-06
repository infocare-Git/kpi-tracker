"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CATEGORIES, FREQUENCIES } from "@/lib/types";
import type { Direction, Frequency, KpiInput } from "@/lib/types";
import { Button, Field, inputClass } from "./ui";

const EMPTY: KpiInput = {
  name: "",
  description: "",
  category: "Finance",
  unit: "",
  target: 0,
  direction: "increase",
  frequency: "monthly",
  owner: "",
};

const UNIT_SUGGESTIONS = ["$", "%", "hrs", "days", "pts", "users", "leads", "orders", "/10"];

export default function KpiForm({
  initial,
  submitLabel = "Save",
  onSubmit,
  onCancel,
}: {
  initial?: KpiInput;
  submitLabel?: string;
  onSubmit: (input: KpiInput) => void;
  onCancel: () => void;
}) {
  const start = initial ?? EMPTY;
  // Pick only the editable fields (initial may be a full Kpi object).
  const [form, setForm] = useState({
    name: start.name,
    description: start.description,
    category: start.category,
    unit: start.unit,
    target: initial ? String(start.target) : "",
    direction: start.direction,
    frequency: start.frequency,
    owner: start.owner,
  });
  const [errors, setErrors] = useState<{ name?: string; target?: string }>({});

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const target = Number(form.target);
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (form.target.trim() === "" || !Number.isFinite(target))
      nextErrors.target = "Enter a valid number.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      owner: form.owner.trim(),
      unit: form.unit.trim(),
      target,
    });
  };

  const categories: string[] = [...CATEGORIES];
  if (form.category && !categories.includes(form.category)) categories.push(form.category);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name" htmlFor="kpi-name" error={errors.name}>
        <input
          id="kpi-name"
          className={inputClass}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Monthly Revenue"
          autoFocus
        />
      </Field>

      <Field label="Description" htmlFor="kpi-desc">
        <textarea
          id="kpi-desc"
          className={inputClass}
          rows={2}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What does this KPI measure?"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="kpi-category">
          <select
            id="kpi-category"
            className={inputClass}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Owner" htmlFor="kpi-owner">
          <input
            id="kpi-owner"
            className={inputClass}
            value={form.owner}
            onChange={(e) => set("owner", e.target.value)}
            placeholder="Team or person"
          />
        </Field>

        <Field label="Target" htmlFor="kpi-target" error={errors.target}>
          <input
            id="kpi-target"
            type="number"
            step="any"
            className={inputClass}
            value={form.target}
            onChange={(e) => set("target", e.target.value)}
            placeholder="100"
          />
        </Field>

        <Field label="Unit" htmlFor="kpi-unit">
          <input
            id="kpi-unit"
            list="unit-suggestions"
            className={inputClass}
            value={form.unit}
            onChange={(e) => set("unit", e.target.value)}
            placeholder="$, %, hrs…"
          />
          <datalist id="unit-suggestions">
            {UNIT_SUGGESTIONS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </Field>

        <Field label="Goal direction" htmlFor="kpi-direction">
          <select
            id="kpi-direction"
            className={inputClass}
            value={form.direction}
            onChange={(e) => set("direction", e.target.value as Direction)}
          >
            <option value="increase">Higher is better</option>
            <option value="decrease">Lower is better</option>
          </select>
        </Field>

        <Field label="Frequency" htmlFor="kpi-frequency">
          <select
            id="kpi-frequency"
            className={inputClass}
            value={form.frequency}
            onChange={(e) => set("frequency", e.target.value as Frequency)}
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f[0].toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
