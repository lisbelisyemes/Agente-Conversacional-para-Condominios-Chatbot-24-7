import type { ReactNode } from "react";

export interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

interface FeatureCardProps {
  feature: Feature;
  delay?: number;
}

export default function FeatureCard({ feature, delay = 0 }: FeatureCardProps) {
  return (
    <div
      className="group rounded-2xl border border-brand-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/10"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-900 group-hover:text-white">
        {feature.icon}
      </div>
      <h3 className="mt-5 text-base font-bold text-brand-950">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
    </div>
  );
}