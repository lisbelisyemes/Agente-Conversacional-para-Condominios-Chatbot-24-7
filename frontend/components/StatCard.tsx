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
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${CHIP[tone]}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className={`mt-3 text-2xl font-bold tracking-tight ${VALUE[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}