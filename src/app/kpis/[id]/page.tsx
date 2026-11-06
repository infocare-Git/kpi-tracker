"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { LineChart } from "@/components/Charts";
import KpiForm from "@/components/KpiForm";
import { ChevronLeftIcon, PencilIcon, TrashIcon } from "@/components/Icons";
import {
  Button,
  Card,
  Field,
  LoadingState,
  Modal,
  ProgressBar,
  StatusBadge,
  inputClass,
} from "@/components/ui";
import { useKpis } from "@/lib/store";
import {
  formatDate,
  formatValue,
  getProgress,
  getStatus,
  getTrend,
  sortedEntries,
  todayISO,
} from "@/lib/utils";

export default function KpiDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { kpis, hydrated, updateKpi, deleteKpi, addEntry, deleteEntry } = useKpis();
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [entryError, setEntryError] = useState("");

  if (!hydrated) return <LoadingState />;

  const kpi = kpis.find((k) => k.id === params.id);

  if (!kpi) {
    return (
      <Card className="p-12 text-center">
        <h1 className="text-lg font-medium text-slate-900">KPI not found</h1>
        <p className="mt-1 text-sm text-slate-500">It may have been deleted.</p>
        <Link href="/kpis" className="mt-4 inline-block text-sm font-medium text-indigo-600">
          ← Back to KPIs
        </Link>
      </Card>
    );
  }

  const entries = sortedEntries(kpi);
  const latest = entries[entries.length - 1];
  const progress = getProgress(kpi);
  const status = getStatus(kpi);
  const trend = getTrend(kpi);

  const handleAddEntry = (e: FormEvent) => {
    e.preventDefault();
    const num = Number(value);
    if (value.trim() === "" || !Number.isFinite(num)) {
      setEntryError("Enter a valid number.");
      return;
    }
    if (!date) {
      setEntryError("Pick a date.");
      return;
    }
    addEntry(kpi.id, { date, value: num, note: note.trim() || undefined });
    setValue("");
    setNote("");
    setEntryError("");
  };

  const handleDelete = () => {
    if (confirm(`Delete "${kpi.name}" and all of its data?`)) {
      deleteKpi(kpi.id);
      router.push("/kpis");
    }
  };

  const stats = [
    { label: "Current", value: latest ? formatValue(latest.value, kpi.unit) : "—" },
    {
      label: "Target",
      value: `${formatValue(kpi.target, kpi.unit)} ${kpi.direction === "increase" ? "↑" : "↓"}`,
    },
    { label: "Progress", value: progress === null ? "—" : `${Math.round(progress * 100)}%` },
    {
      label: "Change (last period)",
      value:
        trend === null
          ? "—"
          : `${trend.delta >= 0 ? "+" : ""}${formatValue(trend.delta, kpi.unit)}${
              trend.percent !== null ? ` (${trend.percent >= 0 ? "+" : ""}${trend.percent.toFixed(1)}%)` : ""
            }`,
      tone: trend ? (trend.isGood ? "text-emerald-600" : "text-rose-600") : undefined,
    },
  ];

  // Newest first for the table, with change vs. the previous entry.
  const rows = entries
    .map((e, i) => ({ ...e, change: i > 0 ? e.value - entries[i - 1].value : null }))
    .reverse();

  return (
    <>
      <Link
        href="/kpis"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ChevronLeftIcon width={16} height={16} /> All KPIs
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{kpi.name}</h1>
            <StatusBadge status={status} />
          </div>
          {kpi.description && <p className="mt-1 text-sm text-slate-500">{kpi.description}</p>}
          <p className="mt-2 text-xs text-slate-400">
            {kpi.category} · {kpi.frequency[0].toUpperCase() + kpi.frequency.slice(1)}
            {kpi.owner && ` · Owner: ${kpi.owner}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <PencilIcon width={16} height={16} /> Edit
          </Button>
          <Button variant="secondary" className="hover:text-rose-600" onClick={handleDelete}>
            <TrashIcon width={16} height={16} /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`mt-1 text-xl font-semibold ${s.tone ?? "text-slate-900"}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <ProgressBar progress={progress} status={status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="mb-4 font-medium text-slate-900">Trend</h2>
          <LineChart entries={entries} target={kpi.target} unit={kpi.unit} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-medium text-slate-900">Add entry</h2>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <Field label="Date" htmlFor="entry-date">
              <input
                id="entry-date"
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label={`Value${kpi.unit ? ` (${kpi.unit})` : ""}`} htmlFor="entry-value" error={entryError}>
              <input
                id="entry-value"
                type="number"
                step="any"
                className={inputClass}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Note (optional)" htmlFor="entry-note">
              <input
                id="entry-note"
                className={inputClass}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Context for this value"
              />
            </Field>
            <Button type="submit" className="w-full">
              Add entry
            </Button>
          </form>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-medium text-slate-900">History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Value</th>
                <th className="px-5 py-3 font-medium">Change</th>
                <th className="px-5 py-3 font-medium">Note</th>
                <th className="px-5 py-3 sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const good =
                  r.change === null
                    ? null
                    : kpi.direction === "increase"
                      ? r.change >= 0
                      : r.change <= 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-600">{formatDate(r.date)}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {formatValue(r.value, kpi.unit)}
                    </td>
                    <td
                      className={`px-5 py-3 ${
                        good === null ? "text-slate-400" : good ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {r.change === null
                        ? "—"
                        : `${r.change >= 0 ? "+" : ""}${formatValue(r.change, kpi.unit)}`}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{r.note ?? ""}</td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        className="px-2 hover:text-rose-600"
                        onClick={() => deleteEntry(kpi.id, r.id)}
                        aria-label="Delete entry"
                      >
                        <TrashIcon width={16} height={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                    No entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={editing} title="Edit KPI" onClose={() => setEditing(false)}>
        <KpiForm
          initial={kpi}
          submitLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSubmit={(input) => {
            updateKpi(kpi.id, input);
            setEditing(false);
          }}
        />
      </Modal>
    </>
  );
}
