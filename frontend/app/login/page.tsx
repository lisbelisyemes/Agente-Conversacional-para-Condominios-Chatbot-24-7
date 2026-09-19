"use client";

import { FormEvent, useState } from "react";
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl sm:p-10" aria-labelledby="login-title">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/20">CI</div>
          <h1 id="login-title" className="text-center text-3xl font-bold text-slate-800">Condominio Inteligente</h1>
          <p className="mt-2 text-center text-slate-500">Panel de Administración</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Correo Electrónico</label>
            <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })); }} aria-invalid={Boolean(errors.email)} className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`} placeholder="nombre@condominio.com" />
            {errors.email && <p className="mt-1.5 text-sm text-red-500" role="alert">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Contraseña</label>
            <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })); }} aria-invalid={Boolean(errors.password)} className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${errors.password ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`} placeholder="Ingresa tu contraseña" />
            {errors.password && <p className="mt-1.5 text-sm text-red-500" role="alert">{errors.password}</p>}
          </div>

          {errors.form && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">{errors.form}</p>}

          <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300">{isLoading ? "Verificando..." : "Iniciar sesión"}</button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">Acceso exclusivo para administradores del condominio</p>
      </section>
    </main>
  );
}