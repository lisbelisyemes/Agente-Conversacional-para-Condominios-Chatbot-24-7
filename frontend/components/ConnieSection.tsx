import Image from "next/image";
import ConnieChat from "./ConnieChat";
import Reveal from "./Reveal";

// Configurar aquí el enlace de WhatsApp de Connie cuando exista un número oficial.
// Mantener vacío mientras no haya un número configurado (no se usan números falsos).
const WHATSAPP_URL = "";

export default function ConnieSection() {
  return (
    <section id="connie" className="overflow-hidden bg-brand-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brand-700">Nuestra asistente</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">
            Conoce a Connie
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
            Tu asistente virtual para mantener la comunicación con los residentes disponible las 24 horas.
          </p>
        </Reveal>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative mx-auto w-fit max-w-sm">
              <div
                className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-brand-200 to-blue-100 blur-xl"
                aria-hidden="true"
              />
              <Image
                src="/images/connie.png"
                alt="Connie, asistente virtual disponible 24/7 por WhatsApp para los residentes del condominio"
                width={1280}
                height={1280}
                className="relative aspect-square w-full rounded-[2.5rem] border border-white object-cover shadow-2xl shadow-brand-900/20"
              />
              <div className="animate-float-soft absolute -right-3 bottom-6 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-brand-900/15 sm:-right-6">
                <p className="text-xs font-bold text-brand-900">Connie</p>
                <p className="text-[11px] text-slate-500">Asistente 24/7</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ConnieChat />
            <p className="mt-4 text-center text-xs text-slate-500 lg:text-left">
              Conversación ilustrativa: el chat de demostración no envía mensajes reales.
            </p>
            <div className="mt-6 flex justify-center lg:justify-start">
              {WHATSAPP_URL ? (
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                    <path d="M12 2C6.5 2 2 6.3 2 11.6c0 1.7.5 3.3 1.4 4.7L2 22l5.9-1.3c1.3.7 2.8 1.1 4.1 1.1 5.5 0 10-4.3 10-9.6S17.5 2 12 2zm0 17.6c-1.3 0-2.6-.3-3.7-1l-.3-.2-3.5.8.9-3.4-.2-.3C4.3 14.7 3.9 13.2 3.9 11.6c0-4.2 3.7-7.7 8.1-7.7s8.1 3.5 8.1 7.7-3.7 7.7-8.1 7.7zm4.5-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.2-.5s0-.4-.1-.5c-.1-.2-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-.9.1-1-.1-.1-.3-.2-.5-.3z" />
                  </svg>
                  Hablar con Connie por WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Enlace de WhatsApp pendiente de configurar"
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-emerald-600/50 px-6 py-3.5 text-sm font-semibold text-white/80"
                >
                  Hablar con Connie por WhatsApp
                </button>
              )}
            </div>
            {!WHATSAPP_URL && (
              <p className="mt-3 text-center text-xs text-slate-500 lg:text-left">
                Enlace por configurar cuando exista un número oficial de Connie.
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}