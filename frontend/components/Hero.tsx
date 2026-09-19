import Image from "next/image";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-brand-50">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60rem 30rem at 85% 15%, rgba(142,182,155,0.28), transparent 60%), radial-gradient(40rem 24rem at 10% 90%, rgba(196,222,203,0.35), transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-24">
        <div className="order-2 lg:order-1">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Asistente disponible las 24 horas
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-brand-950 sm:text-5xl">
              Administración inteligente para tu condominio
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Gestiona pagos, reportes, incidencias y solicitudes desde una sola plataforma, mientras Connie atiende a
              tus residentes 24/7 por WhatsApp.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Acceder al portal
              </a>
              <a
                href="#connie"
                className="inline-flex items-center justify-center rounded-xl border border-brand-300 bg-white px-6 py-3.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
              >
                Conocer a Connie
              </a>
            </div>
          </Reveal>
        </div>

        <div className="order-1 lg:order-2">
          <Reveal delay={120}>
            <div className="relative mx-auto w-fit">
              <div
                className="absolute -inset-6 rounded-[3rem] bg-gradient-to-tr from-brand-200 via-brand-100 to-blue-100 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-2xl shadow-brand-900/20">
                <Image
                  src="/images/connie.png"
                  alt="Ilustración de Connie, asistente virtual de Condominio Inteligente"
                  width={1280}
                  height={1280}
                  priority
                  className="aspect-square w-full max-w-md rounded-[2.5rem] object-cover"
                />
              </div>

              <div className="animate-float-soft absolute -left-4 bottom-10 flex items-center gap-2.5 rounded-2xl border border-brand-100 bg-white/95 px-4 py-3 shadow-lg shadow-brand-900/10 backdrop-blur sm:-left-10">
                <span className="relative flex size-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-brand-900">Disponible 24/7</p>
                  <p className="text-[11px] text-slate-500">WhatsApp</p>
                </div>
              </div>

              <div className="animate-float-soft-delayed absolute -right-3 top-8 rounded-2xl rounded-bl-md bg-brand-900 px-4 py-3 text-xs font-medium text-white shadow-lg shadow-brand-900/20 sm:-right-8">
                ¡Hola! Soy Connie 👋
              </div>

              <div className="absolute -right-2 bottom-2 flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md sm:-right-6">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden="true">
                  <path d="M12 2C6.5 2 2 6.3 2 11.6c0 1.7.5 3.3 1.4 4.7L2 22l5.9-1.3c1.3.7 2.8 1.1 4.1 1.1 5.5 0 10-4.3 10-9.6S17.5 2 12 2zm0 17.6c-1.3 0-2.6-.3-3.7-1l-.3-.2-3.5.8.9-3.4-.2-.3C4.3 14.7 3.9 13.2 3.9 11.6c0-4.2 3.7-7.7 8.1-7.7s8.1 3.5 8.1 7.7-3.7 7.7-8.1 7.7zm4.5-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.2-.5s0-.4-.1-.5c-.1-.2-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-.9.1-1-.1-.1-.3-.2-.5-.3z" />
                </svg>
                WhatsApp
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}