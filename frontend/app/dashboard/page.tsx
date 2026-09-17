"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Report = {
  id: string;
  descripcion: string;
  ubicacion: string;
  estado: string;
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("Resumen");
  const [reports, setReports] = useState<Report[]>([]);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/');
    });
  }, [router]);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("reportes_fallas")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(10);

      if (!error) setReports(data ?? []);
    };

    fetchReports();
  }, []);

  const sections = ["Resumen", "Reportes", "Residentes", "Finanzas"];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col bg-slate-950 px-6 py-7 text-white lg:flex">
          <div className="flex items-center gap-3 border-b border-white/10 pb-7">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-500 font-bold">C</div>
            <div><p className="font-semibold">Condominio Norte</p><p className="text-xs text-slate-400">Panel administrativo</p></div>
          </div>
          <nav className="mt-8 space-y-1" aria-label="Navegación principal">
            {sections.map((section, index) => <button key={section} type="button" onClick={() => setActiveSection(section)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${activeSection === section ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"}`}><span className="grid size-6 place-items-center rounded border border-current text-xs">{index + 1}</span>{section}</button>)}
          </nav>
          <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Asistente operativo 24/7<div className="mt-3 flex items-center gap-2 text-xs text-emerald-400"><span className="size-2 rounded-full bg-emerald-400" /> Sistema estable</div></div>
        </aside>
        <section className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-8">
            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Panel administrativo</p><h1 className="mt-1 text-xl font-bold text-slate-950">Resumen general</h1></div><div className="grid size-10 place-items-center rounded-full bg-slate-200 text-sm font-semibold">AC</div></div>
            <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden" aria-label="Navegación móvil">{sections.map((section) => <button key={section} type="button" onClick={() => setActiveSection(section)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${activeSection === section ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}>{section}</button>)}</nav>
          </header>
          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 lg:px-10">
            <div className="mb-8"><p className="text-sm font-semibold text-blue-600">{activeSection}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Todo bajo control.</h2><p className="mt-2 text-sm text-slate-500">Monitorea la operación diaria de tu condominio desde un solo lugar.</p></div>
            <section className="grid gap-4 sm:grid-cols-3" aria-label="Indicadores principales">{[["Solicitudes activas", "24"], ["Reportes pendientes", "2"], ["Satisfacción", "94%"]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold text-slate-950">{value}</p></div>)}</section>
            <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5"><h2 className="font-semibold">Reportes recientes</h2><p className="mt-1 text-sm text-slate-500">Últimas incidencias registradas por residentes.</p></div>
              {reports.length === 0 ? <p className="px-5 py-4 text-sm text-slate-500">No hay reportes registrados</p> : <div className="divide-y divide-slate-100">{reports.map((report) => {
                const statusClass = report.estado === "Pendiente" ? "bg-amber-50 text-amber-700" : report.estado === "Asignado" ? "bg-blue-50 text-blue-700" : report.estado === "Resuelto" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700";
                return <div key={report.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-800">{report.descripcion}</p><p className="mt-1 text-xs text-slate-400">{report.ubicacion}</p></div><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{report.estado}</span></div>;
              })}</div>}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
