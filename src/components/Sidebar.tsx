"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardIcon, SettingsIcon, TargetIcon } from "./Icons";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/kpis", label: "KPIs", icon: TargetIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
        K
      </span>
      KPI Tracker
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(pathname, href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon width={18} height={18} />
              {label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto px-3 text-xs text-slate-400">Data is stored in your browser.</p>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap",
                isActive(pathname, href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <Icon width={16} height={16} />
              {label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
