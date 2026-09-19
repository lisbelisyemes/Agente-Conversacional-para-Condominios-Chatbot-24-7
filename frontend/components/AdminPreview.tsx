import Reveal from "./Reveal";

const SALDOS = [
  { apto: "101", titular: "Familia Rodríguez", deuda: "$350.00" },
  { apto: "204", titular: "Sr. Canales", deuda: "$0.00" },
  { apto: "304", titular: "Sra. Mejías", deuda: "$250.00" },
  { apto: "501", titular: "Familia Blanco", deuda: "$0.00" },
];

const INCIDENCIAS = [
  { descripcion: "Fuga de agua en el pasillo del piso 2", estado: "Pendiente" },
  { descripcion: "Luminaria dañada en la entrada principal", estado: "Asignado" },
  { descripcion: "Puerta del elevador 2 presenta ruido", estado: "Resuelto" },
];

export default function AdminPreview() {
  return (
    <section id="administracion" className="bg-brand-950 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">
              Portal administrativo
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Todo bajo control
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-brand-200">
              Desde el portal administrativo puedes supervisar la operación diaria del condominio desde un solo lugar.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-brand-200">
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-400" aria-hidden="true">✓</span>
                Deuda total activa y morosidad
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-400" aria-hidden="true">✓</span>
                Incidencias y reportes de residentes
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-400" aria-hidden="true">✓</span>
                Estado del asistente conversacional
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-400" aria-hidden="true">✓</span>
                Apartamentos, estados de cuenta y reglamento
              </li>
            </ul>
            <a
              href="/login"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-900/30 transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
            >
              Acceder al portal administrativo
            </a>
          </Reveal>

          <Reveal delay={120}>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/95 shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-brand-900 text-xs font-bold text-white">
                    C
                  </span>
                  <span className="text-sm font-bold text-brand-950">Panel administrativo</span>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Previsualización
                </span>
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-3">
                <div className="rounded-xl border border-brand-100 bg-white p-4">
                  <p className="text-xs text-slate-500">Deuda total activa</p>
                  <p className="mt-1.5 text-xl font-bold text-brand-950">$600.00</p>
                </div>
                <div className="rounded-xl border border-brand-100 bg-white p-4">
                  <p className="text-xs text-slate-500">Incidencias pendientes</p>
                  <p className="mt-1.5 text-xl font-bold text-amber-600">1</p>
                </div>
                <div className="rounded-xl border border-brand-100 bg-white p-4">
                  <p className="text-xs text-slate-500">Estado del asistente</p>
                  <p className="mt-1.5 flex items-center gap-2 text-xl font-bold text-emerald-600">
                    <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                    En línea
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-brand-100">
                    <p className="border-b border-brand-100 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Saldos por apartamento
                    </p>
                    <div className="divide-y divide-brand-50">
                      {SALDOS.map((apto) => (
                        <div key={apto.apto} className="flex items-center justify-between px-4 py-2.5 text-xs">
                          <div>
                            <p className="font-semibold text-brand-950">Apto {apto.apto}</p>
                            <p className="text-slate-500">{apto.titular}</p>
                          </div>
                          <span className="font-semibold text-brand-950">{apto.deuda}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-brand-100">
                    <p className="border-b border-brand-100 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Incidencias
                    </p>
                    <div className="divide-y divide-brand-50">
                      {INCIDENCIAS.map((incidencia) => (
                        <div key={incidencia.descripcion} className="flex items-center justify-between gap-3 px-4 py-2.5">
                          <p className="truncate text-xs text-slate-700">{incidencia.descripcion}</p>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              incidencia.estado === "Pendiente"
                                ? "bg-amber-100 text-amber-700"
                                : incidencia.estado === "Asignado"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {incidencia.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-brand-200/70 lg:text-left">
              Imagen ilustrativa basada en el dashboard real. No representa datos reales del condominio.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}