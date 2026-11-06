"use client";

import Link from "next/link";
import { useState } from "react";
import KpiForm from "@/components/KpiForm";
import { PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/Icons";
import {
  Button,
  Card,
  LoadingState,
  Modal,
  PageHeader,
  ProgressBar,
  StatusBadge,
  inputClass,
} from "@/components/ui";
import { useKpis } from "@/lib/store";
import type { Kpi, KpiStatus } from "@/lib/types";
import { formatValue, getProgress, getStatus, latestEntry } from "@/lib/utils";

type StatusFilter = KpiStatus | "all";

export default function KpisPage() {
  const { kpis, hydrated, addKpi, updateKpi, deleteKpi } = useKpis();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Kpi | null>(null);

  if (!hydrated) return <LoadingState />;

  const categories = Array.from(new Set(kpis.map((k) => k.category))).sort();

  const q = query.trim().toLowerCase();
  const filtered = kpis.filter(
    (k) =>
      (!q ||
        k.name.toLowerCase().includes(q) ||
        k.owner.toLowerCase().includes(q) ||
        k.description.toLowerCase().includes(q)) &&
      (category === "all" || k.category === category) &&
      (status === "all" || getStatus(k) === status),
  );

  const handleDelete = (kpi: Kpi) => {
    if (confirm(`Delete "${kpi.name}" and all of its data?`)) deleteKpi(kpi.id);
  };

  return (
    <>
      <PageHeader
        title="KPIs"
        description="Manage the metrics you track."
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon width={16} height={16} /> New KPI
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon
            width={16}
            height={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Search by name, owner or description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className={`${inputClass} sm:w-44`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className={`${inputClass} sm:w-40`}
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="on-track">On track</option>
          <option value="at-risk">At risk</option>
          <option value="off-track">Off track</option>
          <option value="no-data">No data</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">KPI</th>
                <th className="px-5 py-3 font-medium">Current</th>
                <th className="px-5 py-3 font-medium">Target</th>
                <th className="w-48 px-5 py-3 font-medium">Progress</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((k) => {
                const latest = latestEntry(k);
                const progress = getProgress(k);
                const s = getStatus(k);
                return (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/kpis/${k.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-700"
                      >
                        {k.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {k.category}
                        {k.owner && ` · ${k.owner}`}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {latest ? formatValue(latest.value, k.unit) : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatValue(k.target, k.unit)}
                      <span className="ml-1 text-xs text-slate-400">
                        {k.direction === "increase" ? "↑" : "↓"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar progress={progress} status={s} />
                        <span className="w-10 text-right text-xs text-slate-500">
                          {progress === null ? "—" : `${Math.round(progress * 100)}%`}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={s} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          className="px-2"
                          onClick={() => setEditing(k)}
                          aria-label={`Edit ${k.name}`}
                        >
                          <PencilIcon width={16} height={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          className="px-2 hover:text-rose-600"
                          onClick={() => handleDelete(k)}
                          aria-label={`Delete ${k.name}`}
                        >
                          <TrashIcon width={16} height={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    {kpis.length === 0 ? "No KPIs yet." : "No KPIs match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={creating} title="New KPI" onClose={() => setCreating(false)}>
        <KpiForm
          submitLabel="Create KPI"
          onCancel={() => setCreating(false)}
          onSubmit={(input) => {
            addKpi(input);
            setCreating(false);
          }}
        />
      </Modal>

      <Modal open={editing !== null} title="Edit KPI" onClose={() => setEditing(null)}>
        {editing && (
          <KpiForm
            key={editing.id}
            initial={editing}
            submitLabel="Save changes"
            onCancel={() => setEditing(null)}
            onSubmit={(input) => {
              updateKpi(editing.id, input);
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </>
  );
}
