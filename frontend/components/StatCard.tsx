import type { ReactNode } from "react";

type StatTone = "green" | "amber" | "red" | "blue" | "gray";

const CHIP: Record<StatTone, string> = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  gray: "bg-slate-100 text-slate-600",
};

const VALUE: Record<StatTone, string> = {
  green: "text-emerald-600",
  amber: "text-amber-600",
  red: "text-red-600",
  blue: "text-brand-800",
  gray: "text-slate-800",
};

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: StatTone;
  hint?: string;
}

export default function StatCard({ label, value, icon, tone = "gray", hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-slate-500">{label}</p>
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg sm:size-9 sm:rounded-xl ${CHIP[tone]}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className={`mt-2.5 truncate text-lg font-bold tracking-tight sm:mt-3 sm:text-2xl ${VALUE[tone]}`}>{value}</p>
      {hint && <p className="mt-1 hidden text-xs text-slate-400 sm:block">{hint}</p>}
    </div>
  );
}