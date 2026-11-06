import Link from "next/link";
import type { Kpi } from "@/lib/types";
import {
  formatValue,
  getProgress,
  getStatus,
  getTrend,
  latestEntry,
  sortedEntries,
} from "@/lib/utils";
import { Sparkline } from "./Charts";
import { ArrowDownIcon, ArrowUpIcon } from "./Icons";
import { ProgressBar, StatusBadge } from "./ui";

export default function KpiCard({ kpi }: { kpi: Kpi }) {
  const latest = latestEntry(kpi);
  const progress = getProgress(kpi);
  const status = getStatus(kpi);
  const trend = getTrend(kpi);
  const values = sortedEntries(kpi).map((e) => e.value);

  return (
    <Link
      href={`/kpis/${kpi.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {kpi.category}
        </span>
        <StatusBadge status={status} />
      </div>

      <h3 className="mt-1 font-medium text-slate-900 group-hover:text-indigo-700">{kpi.name}</h3>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {latest ? formatValue(latest.value, kpi.unit) : "—"}
          </p>
          <p className="text-xs text-slate-500">Target {formatValue(kpi.target, kpi.unit)}</p>
        </div>
        <Sparkline
          values={values}
          color={trend ? (trend.isGood ? "#10b981" : "#f43f5e") : "#94a3b8"}
        />
      </div>

      <div className="mt-4">
        <ProgressBar progress={progress} status={status} />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {progress === null ? "No data" : `${Math.round(progress * 100)}% of target`}
          </span>
          {trend && trend.percent !== null && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium ${
                trend.isGood ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trend.delta >= 0 ? (
                <ArrowUpIcon width={12} height={12} />
              ) : (
                <ArrowDownIcon width={12} height={12} />
              )}
              {Math.abs(trend.percent).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
