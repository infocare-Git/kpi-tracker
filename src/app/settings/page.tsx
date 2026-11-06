"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Button, Card, LoadingState, PageHeader } from "@/components/ui";
import { useKpis } from "@/lib/store";
import type { Kpi } from "@/lib/types";

function isKpiArray(data: unknown): data is Kpi[] {
  return (
    Array.isArray(data) &&
    data.every(
      (k) =>
        k &&
        typeof k === "object" &&
        typeof k.id === "string" &&
        typeof k.name === "string" &&
        typeof k.target === "number" &&
        Array.isArray(k.entries),
    )
  );
}

export default function SettingsPage() {
  const { kpis, hydrated, replaceAll, resetToSample } = useKpis();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  if (!hydrated) return <LoadingState />;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(kpis, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpi-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!isKpiArray(data)) throw new Error("File doesn't look like a KPI Tracker export.");
      if (!confirm(`Replace your current ${kpis.length} KPIs with ${data.length} imported KPIs?`))
        return;
      replaceAll(data);
      setMessage({ type: "ok", text: `Imported ${data.length} KPIs.` });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Could not read that file.",
      });
    }
  };

  const sections = [
    {
      title: "Export data",
      description: "Download all KPIs and entries as a JSON file.",
      action: (
        <Button variant="secondary" onClick={handleExport}>
          Export JSON
        </Button>
      ),
    },
    {
      title: "Import data",
      description: "Replace your data with a previously exported JSON file.",
      action: (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Import JSON
          </Button>
        </>
      ),
    },
    {
      title: "Load sample data",
      description: "Replace everything with the built-in example KPIs.",
      action: (
        <Button
          variant="secondary"
          onClick={() => {
            if (confirm("Replace all data with sample KPIs?")) {
              resetToSample();
              setMessage({ type: "ok", text: "Sample data loaded." });
            }
          }}
        >
          Load sample
        </Button>
      ),
    },
    {
      title: "Delete all data",
      description: "Permanently remove every KPI and entry from this browser.",
      action: (
        <Button
          variant="danger"
          onClick={() => {
            if (confirm("Delete ALL KPIs? This cannot be undone.")) {
              replaceAll([]);
              setMessage({ type: "ok", text: "All data deleted." });
            }
          }}
        >
          Delete all
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your data is saved in this browser's local storage — nothing is sent to a server."
      />

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="divide-y divide-slate-100">
        {sections.map((s) => (
          <div
            key={s.title}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-sm font-medium text-slate-900">{s.title}</h2>
              <p className="text-sm text-slate-500">{s.description}</p>
            </div>
            <div className="shrink-0">{s.action}</div>
          </div>
        ))}
      </Card>
    </>
  );
}
