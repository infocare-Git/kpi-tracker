import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { KpiProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "KPI Tracker",
  description: "Track and visualize your key performance indicators.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <KpiProvider>
          <div className="flex min-h-screen flex-col lg:flex-row">
            <Sidebar />
            <main className="min-w-0 flex-1">
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
            </main>
          </div>
        </KpiProvider>
      </body>
    </html>
  );
}
