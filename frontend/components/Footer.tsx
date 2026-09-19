const FOOTER_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Características", href: "#caracteristicas" },
  { label: "Connie", href: "#connie" },
  { label: "¿Cómo funciona?", href: "#como-funciona" },
  { label: "Portal administrativo", href: "/login" },
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-brand-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center gap-2.5 md:justify-start">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-900 text-white" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
                  <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-[15px] font-bold tracking-tight text-brand-950">Condominio Inteligente</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">Asistente de Condominio 24/7</p>
          </div>

          <nav aria-label="Enlaces del pie de página">
            <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-brand-100 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Condominio Inteligente. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}