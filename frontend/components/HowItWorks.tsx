import Reveal from "./Reveal";

const STEPS = [
  { label: "Residente", description: "Se comunica por WhatsApp" },
  { label: "WhatsApp", description: "Canal de comunicación directo" },
  { label: "Connie", description: "Asistente virtual 24/7" },
  { label: "Automatización", description: "Procesa y organiza la solicitud" },
  { label: "Información del condominio", description: "Estados de cuenta, reglamento, reportes" },
  { label: "Portal administrativo", description: "La administración supervisa y gestiona" },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brand-700">
            Proceso
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">
            ¿Cómo funciona?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg leading-relaxed text-slate-600">
            El residente se comunica con Connie por WhatsApp. El asistente procesa la solicitud, consulta la
            información disponible y ayuda a responder preguntas o registrar solicitudes y reportes. La administración
            puede supervisar y gestionar esta información desde el portal administrativo.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <ol className="mx-auto mt-14 grid max-w-5xl gap-3">
            {STEPS.map((step, index) => (
              <li key={step.label} className="flex items-center gap-4">
                <div className="flex flex-1 items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 px-5 py-4 transition-colors hover:border-brand-300 hover:bg-white">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-900 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-950">{step.label}</p>
                    <p className="truncate text-xs text-slate-500">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <span className="hidden shrink-0 text-brand-400 sm:block" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                      <path d="M12 4v16m0 0-5-5m5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}