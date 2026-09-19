import Reveal from "./Reveal";

export default function CtaFinal() {
  return (
    <section id="cta" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-900 px-6 py-16 text-center sm:px-12 lg:py-20">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(30rem 20rem at 15% 10%, rgba(142,182,155,0.25), transparent 60%), radial-gradient(30rem 20rem at 85% 90%, rgba(59,130,246,0.18), transparent 60%)",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Una administración más conectada comienza aquí.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-brand-200">
                Centraliza la gestión de tu condominio y mantén la atención disponible para tus residentes 24/7.
              </p>
              <a
                href="/login"
                className="mt-9 inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
              >
                Acceder al portal
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}