"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Apartamento = {
  id: number;
  numero: string;
  nombre_titular: string;
  saldo_pendiente: number;
};

type ReporteFalla = {
  id: number;
  descripcion: string;
  ubicacion: string;
  estado: string;
  fecha: string;
};

type Reglamento = {
  id: number;
  pagina: number;
  contenido: string;
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("Resumen");
  
  // Estados para cada tabla de Supabase
  const [reportes, setReportes] = useState<ReporteFalla[]>([]);
  const [apartamentos, setApartamentos] = useState<Apartamento[]>([]);
  const [reglamento, setReglamento] = useState<Reglamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const sections = ["Resumen", "Reglamento", "Estados de cuenta", "Incidencias"];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/');
    });
  }, [router]);

  // Carga de datos dinámica según la sección activa
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      if (activeSection === "Resumen") {
        const { data: resReportes } = await supabase.from("reportes_fallas").select("*").eq("estado", "Pendiente");
        const { data: resAptos } = await supabase.from("apartamentos").select("*");
        setReportes(resReportes ?? []);
        setApartamentos(resAptos ?? []);
      } 
      else if (activeSection === "Incidencias") {
        const { data } = await supabase.from("reportes_fallas").select("*").order("fecha", { ascending: false });
        setReportes(data ?? []);
      } 
      else if (activeSection === "Estados de cuenta") {
        const { data } = await supabase.from("apartamentos").select("*").order("numero", { ascending: true });
        setApartamentos(data ?? []);
      } 
      else if (activeSection === "Reglamento") {
        const { data } = await supabase.from("reglamento_embeddings").select("id, pagina, contenido").order("pagina", { ascending: true });
        setReglamento(data ?? []);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [activeSection]);

  // Funciones de renderizado para mantener el código limpio
  const renderResumen = () => {
    const deudaTotal = apartamentos.reduce((acc, apto) => acc + Number(apto.saldo_pendiente || 0), 0);
    const reportesPendientes = reportes.length;

    return (
      <>
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">Resumen</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Todo esta bien.</h2>
          <p className="mt-2 text-sm text-slate-500">Monitorea la operación diaria de tu condominio desde un solo lugar.</p>
        </div>
        <section className="grid gap-4 sm:grid-cols-3" aria-label="Indicadores principales">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Deuda Total Activa</p>
            <p className="mt-3 text-2xl font-bold text-slate-950">${deudaTotal.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Incidencias Pendientes</p>
            <p className="mt-3 text-2xl font-bold text-slate-950">{reportesPendientes}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Estado del Bot</p>
            <p className="mt-3 text-2xl font-bold text-emerald-600">En línea</p>
          </div>
        </section>
      </>
    );
  };

  const renderReglamento = () => (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="font-semibold">Reglamento Interno Base</h2>
        <p className="mt-1 text-sm text-slate-500">Fragmentos ingeridos por el asistente conversacional para responder a residentes.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {isLoading ? <p className="px-5 py-4 text-sm text-slate-500">Cargando reglamento...</p> : reglamento.map((regla) => (
          <div key={regla.id} className="flex gap-4 px-5 py-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
              {regla.pagina}
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">{regla.contenido}</p>
          </div>
        ))}
      </div>
    </section>
  );

  const renderEstadosDeCuenta = () => (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="font-semibold">Saldos por Apartamento</h2>
        <p className="mt-1 text-sm text-slate-500">Control de morosidad y cuentas por cobrar.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Apto</th>
              <th scope="col" className="px-5 py-3 font-medium">Titular</th>
              <th scope="col" className="px-5 py-3 font-medium">Estado</th>
              <th scope="col" className="px-5 py-3 font-medium text-right">Saldo Pendiente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <tr><td colSpan={4} className="px-5 py-4 text-center">Cargando cuentas...</td></tr> : apartamentos.map((apto) => (
              <tr key={apto.id} className="hover:bg-slate-50/50">
                <td className="px-5 py-4 font-semibold text-slate-900">{apto.numero}</td>
                <td className="px-5 py-4">{apto.nombre_titular || 'Sin registrar'}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${apto.saldo_pendiente > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {apto.saldo_pendiente > 0 ? "Con Deuda" : "Solvente"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-medium text-slate-900">
                  ${Number(apto.saldo_pendiente).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderIncidencias = () => (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="font-semibold">Historial de Incidencias</h2>
        <p className="mt-1 text-sm text-slate-500">Reportes generados por los residentes mediante WhatsApp.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {isLoading ? <p className="px-5 py-4 text-sm text-slate-500">Cargando incidencias...</p> : reportes.length === 0 ? <p className="px-5 py-4 text-sm text-slate-500">No hay reportes registrados</p> : reportes.map((reporte) => {
          const statusClass = reporte.estado === "Pendiente" ? "bg-amber-50 text-amber-700" : reporte.estado === "Asignado" ? "bg-blue-50 text-blue-700" : reporte.estado === "Resuelto" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700";
          const fechaFormateada = new Date(reporte.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
          
          return (
            <div key={reporte.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col">
                <p className="font-semibold text-slate-800">{reporte.descripcion}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  <span>📍 {reporte.ubicacion}</span>
                  <span>📅 {fechaFormateada}</span>
                </div>
              </div>
              <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                {reporte.estado}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col bg-slate-950 px-6 py-7 text-white lg:flex">
          <div className="flex items-center gap-3 border-b border-white/10 pb-7">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-500 font-bold">C</div>
            <div>
              <p className="font-semibold">Condominio Inteligente</p>
              <p className="text-xs text-slate-400">Panel administrativo</p>
            </div>
          </div>
          <nav className="mt-8 space-y-1" aria-label="Navegación principal">
            {sections.map((section) => (
              <button 
                key={section} 
                type="button" 
                onClick={() => setActiveSection(section)} 
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${activeSection === section ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                {section}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Asistente operativo 24/7
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Sistema en línea
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 flex flex-col h-screen overflow-hidden">
          <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-5 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Panel administrativo</p>
                <h1 className="mt-1 text-xl font-bold text-slate-950">{activeSection}</h1>
              </div>
              <div className="grid size-10 place-items-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold shadow-inner">
                AD
              </div>
            </div>
            <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden pb-2" aria-label="Navegación móvil">
              {sections.map((section) => (
                <button 
                  key={section} 
                  type="button" 
                  onClick={() => setActiveSection(section)} 
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${activeSection === section ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {section}
                </button>
              ))}
            </nav>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-7xl">
              {activeSection === "Resumen" && renderResumen()}
              {activeSection === "Reglamento" && renderReglamento()}
              {activeSection === "Estados de cuenta" && renderEstadosDeCuenta()}
              {activeSection === "Incidencias" && renderIncidencias()}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
