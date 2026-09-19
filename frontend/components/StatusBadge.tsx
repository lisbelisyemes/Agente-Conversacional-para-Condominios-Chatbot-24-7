import type { ReactNode } from "react";

type StatusTone = "green" | "amber" | "red" | "blue" | "gray";

const TONES: Record<StatusTone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
};

const DOTS: Record<StatusTone, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  gray: "bg-slate-400",
};

interface StatusBadgeProps {
  tone?: StatusTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

export default function StatusBadge({
  tone = "gray",
  children,
  dot = true,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {dot && <span className={`size-1.5 rounded-full ${DOTS[tone]}`} aria-hidden="true" />}
      {children}
    </span>
  );
}