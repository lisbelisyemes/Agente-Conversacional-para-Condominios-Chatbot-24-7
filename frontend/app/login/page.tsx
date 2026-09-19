"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface LoginErrors {
  email?: string;
  password?: string;
  form?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: LoginErrors = {};
    const normalizedEmail = email.trim();

    if (!emailPattern.test(normalizedEmail)) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }
    if (password.length < 6) {
      nextErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    setIsLoading(false);

    if (error) {
      setErrors({ form: "Correo o contraseña incorrectos." });
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative flex flex-col overflow-hidden bg-brand-900">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(42rem 32rem at 12% 0%, rgba(142,182,155,0.22), transparent 60%), radial-gradient(36rem 28rem at 95% 100%, rgba(59,130,246,0.14), transparent 60%)",
            }}
          />
          <div className="relative flex flex-col gap-6 px-5 py-7 sm:px-8 lg:gap-0 lg:px-12 lg:py-12 xl:px-16">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-brand-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6">
                  <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="text-lg font-bold text-white">Condominio Inteligente</p>
                <p className="text-xs text-brand-200">Portal administrativo</p>
              </div>
            </div>

            <div className="flex items-center gap-5 lg:my-auto lg:flex-col lg:items-start lg:gap-6 lg:py-10">
              <div className="relative shrink-0">
                <div
                  className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-brand-700/60 via-brand-500/40 to-blue-500/20 blur-xl lg:-inset-5 lg:rounded-[3rem] lg:blur-2xl"
                  aria-hidden="true"
                />
                <Image
                  src="/images/connie.png"
                  alt="Connie, asistente virtual de Condominio Inteligente, disponible 24/7"
                  width={1280}
                  height={1280}
                  priority
                  className="animate-float-soft relative w-28 rounded-2xl border border-white/15 object-cover shadow-xl shadow-black/40 sm:w-32 lg:w-44 lg:rounded-[2rem] lg:shadow-2xl xl:w-52"
                />
                <div className="absolute -right-3 bottom-2 flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg lg:-right-4 lg:bottom-4 lg:px-3 lg:py-1.5 lg:text-[11px]">
                  <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
                  Disponible 24/7
                </div>
              </div>

              <div className="min-w-0">
                <h1 className="max-w-md text-2xl font-extrabold leading-tight tracking-tight text-white lg:text-3xl xl:text-4xl">
                  Tu condominio, siempre bajo control.
                </h1>
                <p className="mt-2 max-w-md text-sm text-brand-200 lg:mt-4 lg:text-base">
                  Administra pagos, incidencias y la información de tu comunidad desde un solo lugar.
                </p>
              </div>

              <ul className="mt-2 hidden space-y-3 text-sm text-brand-200 lg:block">
                <li className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-lg bg-white/10 text-brand-100">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                      <rect x="4" y="10.5" width="16" height="10" rx="2" />
                      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  Acceso seguro y restringido a la administración
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-lg bg-white/10 text-brand-100">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                      <path d="M12 3v18M3 12h18" strokeLinecap="round" />
                      <path d="m5.5 5.5 13 13M18.5 5.5l-13 13" strokeLinecap="round" />
                    </svg>
                  </span>
                  Operación automatizada con el asistente 24/7
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-lg bg-white/10 text-brand-100">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                      <rect x="3" y="4" width="18" height="14" rx="2" />
                      <path d="M8 21h8M12 18v3" strokeLinecap="round" />
                    </svg>
                  </span>
                  Todo el condominio organizado en un solo lugar
                </li>
              </ul>
            </div>

            <p className="text-xs text-brand-300/80 lg:mt-auto">Condominio Inteligente · Asistente de Condominio 24/7</p>
          </div>
        </aside>

        <section className="relative flex flex-1 items-center justify-center bg-brand-50 px-4 py-10 lg:bg-slate-50">
          <div
            className="animate-fade-up pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(30rem 22rem at 90% 0%, rgba(142,182,155,0.22), transparent 60%), radial-gradient(26rem 20rem at 5% 100%, rgba(196,222,203,0.3), transparent 60%)",
            }}
          />
          <div className="relative w-full max-w-md">
            <Link
              href="/"
              className="animate-fade-up inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
              style={{ animationDelay: "60ms" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
                <path d="M19 12H5m0 0 6-6m-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Volver al inicio
            </Link>

            <div
              className="animate-fade-up mt-6 rounded-3xl border border-brand-100 bg-white p-8 shadow-2xl shadow-brand-900/10 sm:p-10"
              style={{ animationDelay: "140ms" }}
            >
              <h1 id="login-title" className="text-3xl font-extrabold tracking-tight text-brand-950">
                Bienvenido de nuevo
              </h1>
              <p className="mt-2 text-sm text-slate-600">Accede al portal administrativo de tu condominio.</p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
                        <rect x="3" y="5" width="18" height="14" rx="2.5" />
                        <path d="m3.5 7 8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setErrors((current) => ({ ...current, email: undefined }));
                      }}
                      aria-invalid={Boolean(errors.email)}
                      className={`w-full rounded-xl border py-3 pl-11 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                        errors.email
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                          : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
                      }`}
                      placeholder="nombre@condominio.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                    Contraseña
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
                        <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
                        <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" strokeLinecap="round" />
                        <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setErrors((current) => ({ ...current, password: undefined }));
                      }}
                      aria-invalid={Boolean(errors.password)}
                      className={`w-full rounded-xl border py-3 pl-11 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                        errors.password
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                          : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
                      }`}
                      placeholder="Ingresa tu contraseña"
                    />
                  </div>
                  {errors.password && <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.password}</p>}
                </div>

                {errors.form && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 size-4 shrink-0" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v4.5M12 15.5h.01" strokeLinecap="round" />
                    </svg>
                    <span>El correo o la contraseña no son correctos.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isLoading ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4 animate-spin" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" opacity="0.3" />
                        <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
                      </svg>
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-slate-400">
                Acceso exclusivo para administradores del condominio
              </p>
              <p className="mt-3 text-center text-xs text-slate-400">¿Necesitas ayuda? Contacta a la administración.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}