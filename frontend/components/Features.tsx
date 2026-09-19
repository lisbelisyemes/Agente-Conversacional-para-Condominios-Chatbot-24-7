import FeatureCard, { type Feature } from "./FeatureCard";
import Reveal from "./Reveal";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-6",
  "aria-hidden": true,
} as const;

const FEATURES: Feature[] = [
  {
    title: "Atención 24/7",
    description: "Connie responde consultas de los residentes mediante WhatsApp.",
    icon: (
      <svg {...iconProps}>
        <path d="M21 11.5a8.4 8.4 0 0 1-9.4 8.4 8.6 8.6 0 0 1-3.2-.8L3 21l1.9-5.2a8.4 8.4 0 1 1 16.1-4.3z" />
        <path d="M8.5 10h7M8.5 13.5h4.5" />
      </svg>
    ),
  },
  {
    title: "Gestión financiera",
    description: "Consulta pagos, cargos, saldos y estados de cuenta.",
    icon: (
      <svg {...iconProps}>
        <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M5 6V4.5M19 6V4.5" />
      </svg>
    ),
  },
  {
    title: "Control de morosidad",
    description: "Identifica apartamentos con pagos pendientes y realiza seguimiento.",
    icon: (
      <svg {...iconProps}>
        <path d="M3 3v18h18" />
        <path d="M7 14l3.5-4 3 3L18 8" />
        <circle cx="18" cy="8" r="1.4" />
      </svg>
    ),
  },
  {
    title: "Gestión de incidencias",
    description: "Registra y supervisa reportes enviados por los residentes.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 6h16M12 6v4" />
        <path d="M8.5 10v8M15.5 10v8" />
        <path d="M6.5 18h11" />
      </svg>
    ),
  },
  {
    title: "Información centralizada",
    description: "Consulta la información importante del condominio desde un solo lugar.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 5v15h16" />
        <path d="M8 10h8M8 13.5h8M8 17h5" />
      </svg>
    ),
  },
  {
    title: "Portal administrativo",
    description: "Gestiona la operación desde un dashboard diseñado para la administración.",
    icon: (
      <svg {...iconProps}>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="4" rx="1.5" />
        <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section id="caracteristicas" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brand-700">
            Características
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">
            Todo lo que necesitas para administrar tu condominio
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-slate-600">
            Una plataforma pensada para centralizar la atención a residentes y la gestión administrativa.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 3) * 80}>
              <FeatureCard feature={feature} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}