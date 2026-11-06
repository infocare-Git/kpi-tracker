"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Kpi, KpiEntry, KpiInput } from "./types";
import { createSampleKpis } from "./sample-data";
import { uid, todayISO } from "./utils";

const STORAGE_KEY = "kpi-tracker:v1";

interface KpiStore {
  kpis: Kpi[];
  /** False until data has been loaded from localStorage. */
  hydrated: boolean;
  addKpi: (input: KpiInput) => Kpi;
  updateKpi: (id: string, input: KpiInput) => void;
  deleteKpi: (id: string) => void;
  addEntry: (kpiId: string, entry: Omit<KpiEntry, "id">) => void;
  deleteEntry: (kpiId: string, entryId: string) => void;
  replaceAll: (kpis: Kpi[]) => void;
  resetToSample: () => void;
}

const KpiContext = createContext<KpiStore | null>(null);

export function KpiProvider({ children }: { children: ReactNode }) {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setKpis(raw ? (JSON.parse(raw) as Kpi[]) : createSampleKpis());
    } catch {
      setKpis(createSampleKpis());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(kpis));
  }, [kpis, hydrated]);

  const addKpi = useCallback((input: KpiInput) => {
    const kpi: Kpi = { ...input, id: uid(), entries: [], createdAt: todayISO() };
    setKpis((prev) => [...prev, kpi]);
    return kpi;
  }, []);

  const updateKpi = useCallback((id: string, input: KpiInput) => {
    setKpis((prev) => prev.map((k) => (k.id === id ? { ...k, ...input } : k)));
  }, []);

  const deleteKpi = useCallback((id: string) => {
    setKpis((prev) => prev.filter((k) => k.id !== id));
  }, []);

  const addEntry = useCallback((kpiId: string, entry: Omit<KpiEntry, "id">) => {
    setKpis((prev) =>
      prev.map((k) =>
        k.id === kpiId ? { ...k, entries: [...k.entries, { ...entry, id: uid() }] } : k,
      ),
    );
  }, []);

  const deleteEntry = useCallback((kpiId: string, entryId: string) => {
    setKpis((prev) =>
      prev.map((k) =>
        k.id === kpiId ? { ...k, entries: k.entries.filter((e) => e.id !== entryId) } : k,
      ),
    );
  }, []);

  const replaceAll = useCallback((next: Kpi[]) => setKpis(next), []);
  const resetToSample = useCallback(() => setKpis(createSampleKpis()), []);

  const value = useMemo<KpiStore>(
    () => ({
      kpis,
      hydrated,
      addKpi,
      updateKpi,
      deleteKpi,
      addEntry,
      deleteEntry,
      replaceAll,
      resetToSample,
    }),
    [kpis, hydrated, addKpi, updateKpi, deleteKpi, addEntry, deleteEntry, replaceAll, resetToSample],
  );

  return <KpiContext.Provider value={value}>{children}</KpiContext.Provider>;
}

export function useKpis(): KpiStore {
  const ctx = useContext(KpiContext);
  if (!ctx) throw new Error("useKpis must be used inside <KpiProvider>");
  return ctx;
}
