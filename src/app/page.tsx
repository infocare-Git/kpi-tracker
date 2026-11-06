"use client";

import Link from "next/link";
import { useState } from "react";
import KpiCard from "@/components/KpiCard";
import KpiForm from "@/components/KpiForm";
import { PlusIcon } from "@/components/Icons";
import { Button, Card, LoadingState, Modal, PageHeader, StatusBadge } from "@/components/ui";
import { useKpis } from "@/lib/store";
import type { KpiStatus } from "@/lib/types";
import { formatValue, getProgress, getStatus, latestEntry } from "@/lib/utils";

export default function DashboardPage() {
  const { kpis, hydrated, addKpi } = useKpis();
  const [creating, setCreating] = useState(false);

  if (!hydrated) return <LoadingState />;

  const counts: Record<KpiStatus, number> = {
    "on-track": 0,
    "at-risk": 0,
    "off-track": 0,
    "no-data": 0,
  };
  kpis.forEach((k) => counts[getStatus(k)]++);

  const progresses = kpis.map(getProgress).filter((p): p is number => p !== null);
  const avgProgress = progresses.length
    ? progresses.reduce((sum, p) => sum + Math.min(p, 1), 0) / progresses.length
    : 0;

  const needsAttention = kpis
    .filter((k) => ["off-track", "at-risk"].includes(getStatus(k)))
    .sort((a, b) => (getProgress(a) ?? 0) - (getProgress(b) ?? 0));

  const stats = [
    { label: "Total KPIs", value: kpis.length, tone: "text-slate-900" },
    { label: "On track", value: counts["on-track"], tone: "text-emerald-600" },
    { label: "At risk", value: counts["at-risk"], tone: "text-amber-600" },
    { label: "Off track", value: counts["off-track"], tone: "text-rose-600" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of how your key metrics are performing."
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon width={16} height={16} /> New KPI
          </Button>
        }
      />

      {kpis.length === 0 ? (
        <Card className="p-12 text-center">
          <h2 className="text-lg font-medium text-slate-900">No KPIs yet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create your first KPI to start tracking progress.
          </p>
          <Button className="mt-4" onClick={() => setCreating(true)}>
            <PlusIcon width={16} height={16} /> Create KPI
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {stats.map((s) => (
              <Card key={s.label} className="p-5">
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className={`mt-1 text-3xl font-semibold ${s.tone}`}>{s.value}</p>
              </Card>
            ))}
            <Card className="col-span-2 p-5 lg:col-span-1">
              <p className="text-sm text-slate-500">Avg. progress</p>
              <p className="mt-1 text-3xl font-semibold text-indigo-600">
                {Math.round(avgProgress * 100)}%
              </p>
            </Card>
          </div>

          {/* Needs attention */}
          {needsAttention.length > 0 && (
            <Card>
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-medium text-slate-900">Needs attention</h2>
              </div>
              <ul className="divide-y divide-slate-100">
                {needsAttention.map((k) => {
                  const latest = latestEntry(k);
                  const p = getProgress(k);
                  return (
                    <li key={k.id}>
                      <Link
                        href={`/kpis/${k.id}`}
                        className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{k.name}</p>
                          <p className="text-xs text-slate-500">
                            {latest ? formatValue(latest.value, k.unit) : "—"} of{" "}
                            {formatValue(k.target, k.unit)} target
                            {p !== null && ` · ${Math.round(p * 100)}%`}
                          </p>
                        </div>
                        <StatusBadge status={getStatus(k)} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {/* All KPIs */}
          <div>
            <h2 className="mb-3 font-medium text-slate-900">All KPIs</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {kpis.map((k) => (
                <KpiCard key={k.id} kpi={k} />
              ))}
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
