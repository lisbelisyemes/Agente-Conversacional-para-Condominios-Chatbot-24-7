"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Apartamento = {
  id: number;
  numero: string;
  nombre_titular: string;
  saldo_pendiente: number;
};

type MovimientoFinanciero = {
  id: number;
  concepto: string;
  monto: number;
  mes: string;
  estado: string;
  fecha_vencimiento: string | null;
};

type ReporteFalla = {
  id: number;
  descripcion: string;
  ubicacion: string;
  estado: string;
  fecha: string;
  urgente: boolean;
  telefono_reporta: string;
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
  const [isApartamentoModalOpen, setIsApartamentoModalOpen] = useState(false);
  const [apartamentoForm, setApartamentoForm] = useState({
    numero: "",
    nombre_titular: "",
    piso: "",
    telefono_titular: "",
  });
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [apartamentoSeleccionado, setApartamentoSeleccionado] = useState<number | null>(null);
  const [cargoForm, setCargoForm] = useState({
    concepto: "",
    monto: "",
    mes: "",
    fecha_vencimiento: "",
  });
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [apartamentoDetalle, setApartamentoDetalle] = useState<Apartamento | null>(null);
  const [movimientosDetalle, setMovimientosDetalle] = useState<MovimientoFinanciero[]>([]);
  const [isLoadingDetalle, setIsLoadingDetalle] = useState(false);
  
  const router = useRouter();
  const sections = ["Resumen", "Reglamento", "Estados de cuenta", "Incidencias"];

  const recargarApartamentos = useCallback(async () => {
    const { data } = await supabase.from("apartamentos").select("*").order("numero", { ascending: true });
    setApartamentos(data ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login');
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
        const { data } = await supabase
          .from("reportes_fallas")
          .select("*")
          .order("urgente", { ascending: false })
          .order("fecha", { ascending: false });
        setReportes(data ?? []);
      } 
      else if (activeSection === "Estados de cuenta") {
        await recargarApartamentos();
      } 
      else if (activeSection === "Reglamento") {
        const { data } = await supabase.from("reglamento_embeddings").select("id, pagina, contenido").order("pagina", { ascending: true });
        setReglamento(data ?? []);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [activeSection, recargarApartamentos]);

  const handleCrearApartamento = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!apartamentoForm.numero.trim() || !apartamentoForm.nombre_titular.trim() || !apartamentoForm.piso.trim() || !apartamentoForm.telefono_titular.trim()) {
      alert("Completa todos los campos del apartamento.");
      return;
    }

    try {
      const { error } = await supabase.from("apartamentos").insert([{
        numero: String(apartamentoForm.numero),
        nombre_titular: String(apartamentoForm.nombre_titular),
        piso: String(apartamentoForm.piso),
        telefono_titular: String(apartamentoForm.telefono_titular),
        saldo_pendiente: 0,
      }]);

      if (error) {
        alert("Error al guardar apartamento: " + error.message);
        console.error(error);
        return;
      }

      alert("Apartamento guardado con éxito");
      setIsApartamentoModalOpen(false);
      setApartamentoForm({ numero: "", nombre_titular: "", piso: "", telefono_titular: "" });
      await recargarApartamentos();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el apartamento.");
    }
  };

  const handleCrearCargo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (apartamentoSeleccionado === null) return;

    if (!cargoForm.concepto.trim() || !cargoForm.monto || !cargoForm.mes.trim() || !cargoForm.fecha_vencimiento) {
      alert("Completa concepto, monto, mes y fecha de vencimiento.");
      return;
    }

    const montoNumero = Number(cargoForm.monto);
    if (Number.isNaN(montoNumero) || montoNumero <= 0) {
      alert("El monto debe ser un número mayor a 0.");
      return;
    }

    try {
      const { error } = await supabase.from("movimientos_financieros").insert([{
        apartamento_id: Number(apartamentoSeleccionado),
        concepto: String(cargoForm.concepto),
        monto: montoNumero,
        mes: String(cargoForm.mes),
        estado: "Pendiente",
        fecha_vencimiento: cargoForm.fecha_vencimiento,
      }]);

      if (error) {
        alert("Error al guardar cargo: " + error.message);
        console.error(error);
        return;
      }

      const { data: movimientosPendientes, error: errorSuma } = await supabase
        .from("movimientos_financieros")
        .select("monto")
        .eq("apartamento_id", Number(apartamentoSeleccionado))
        .eq("estado", "Pendiente");

      if (errorSuma) {
        alert("Error al recalcular saldo pendiente: " + errorSuma.message);
        console.error(errorSuma);
        return;
      }

      const saldoPendiente = (movimientosPendientes ?? []).reduce((acc, movimiento) => acc + Number(movimiento.monto || 0), 0);

      const { error: errorUpdate } = await supabase
        .from("apartamentos")
        .update({ saldo_pendiente: Number(saldoPendiente) })
        .eq("id", Number(apartamentoSeleccionado));

      if (errorUpdate) {
        alert("Error al actualizar saldo del apartamento: " + errorUpdate.message);
        console.error(errorUpdate);
        return;
      }

      alert("Cargo guardado con éxito");
      setIsCargoModalOpen(false);
      setApartamentoSeleccionado(null);
      setCargoForm({ concepto: "", monto: "", mes: "", fecha_vencimiento: "" });
      await recargarApartamentos();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el cargo.");
    }
  };

  const actualizarEstadoReporte = async (reporteId: number, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from("reportes_fallas")
        .update({ estado: nuevoEstado })
        .eq("id", reporteId);

      if (error) {
        alert("Error al actualizar el estado: " + error.message);
        console.error(error);
        return;
      }

      const { data } = await supabase
        .from("reportes_fallas")
        .select("*")
        .order("urgente", { ascending: false })
        .order("fecha", { ascending: false });
      setReportes(data ?? []);
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado.");
    }
  };

  const recalcularSaldoApartamento = async (apartamentoId: number) => {
    const { data: pendientes } = await supabase
      .from("movimientos_financieros")
      .select("monto")
      .eq("apartamento_id", apartamentoId)
      .eq("estado", "Pendiente");

    const nuevoSaldo = (pendientes ?? []).reduce((acc, movimiento) => acc + Number(movimiento.monto || 0), 0);

    await supabase.from("apartamentos").update({ saldo_pendiente: nuevoSaldo }).eq("id", apartamentoId);
  };

  const abrirDetalleApartamento = async (apto: Apartamento) => {
    setApartamentoDetalle(apto);
    setIsDetalleModalOpen(true);
    setIsLoadingDetalle(true);

    const { data } = await supabase
      .from("movimientos_financieros")
      .select("id, concepto, monto, mes, estado, fecha_vencimiento")
      .eq("apartamento_id", apto.id)
      .order("created_at", { ascending: false });

    setMovimientosDetalle(data ?? []);
    setIsLoadingDetalle(false);
  };

  const marcarComoPagado = async (movimientoId: number, apartamentoId: number) => {
    try {
      const { error } = await supabase
        .from("movimientos_financieros")
        .update({ estado: "Pagado" })
        .eq("id", movimientoId);

      if (error) {
        alert("Error al marcar como pagado: " + error.message);
        console.error(error);
        return;
      }

      await recalcularSaldoApartamento(apartamentoId);

      const { data } = await supabase
        .from("movimientos_financieros")
        .select("id, concepto, monto, mes, estado, fecha_vencimiento")
        .eq("apartamento_id", apartamentoId)
        .order("created_at", { ascending: false });
      setMovimientosDetalle(data ?? []);

      await recargarApartamentos();
    } catch (err) {
      console.error(err);
      alert("No se pudo marcar el cargo como pagado.");
    }
  };

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
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5">
        <div>
          <h2 className="font-semibold">Saldos por Apartamento</h2>
          <p className="mt-1 text-sm text-slate-500">Control de morosidad y cuentas por cobrar.</p>
        </div>
        <button type="button" onClick={() => setIsApartamentoModalOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Añadir Apartamento
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Apto</th>
              <th scope="col" className="px-5 py-3 font-medium">Titular</th>
              <th scope="col" className="px-5 py-3 font-medium">Estado</th>
              <th scope="col" className="px-5 py-3 font-medium text-right">Saldo Pendiente</th>
              <th scope="col" className="px-5 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <tr><td colSpan={5} className="px-5 py-4 text-center">Cargando cuentas...</td></tr> : apartamentos.map((apto) => (
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
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => abrirDetalleApartamento(apto)}
                    className="mr-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Ver movimientos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApartamentoSeleccionado(apto.id);
                      setIsCargoModalOpen(true);
                    }}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                  >
                    Añadir Cargo
                  </button>
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
            <div key={reporte.id} className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between transition-colors ${reporte.urgente ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-slate-50/50"}`}>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {reporte.urgente && (
                    <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                      🚨 URGENTE
                    </span>
                  )}
                  <p className="font-semibold text-slate-800">{reporte.descripcion}</p>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>📍 {reporte.ubicacion}</span>
                  <span>📅 {fechaFormateada}</span>
                  <span>📞 {reporte.telefono_reporta}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                  {reporte.estado}
                </span>
                {reporte.estado !== "Resuelto" && (
                  <>
                    <button
                      type="button"
                      onClick={() => actualizarEstadoReporte(reporte.id, "Asignado")}
                      className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      Asignar
                    </button>
                    <button
                      type="button"
                      onClick={() => actualizarEstadoReporte(reporte.id, "Resuelto")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Resolver
                    </button>
                  </>
                )}
              </div>
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

      {isApartamentoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Añadir Apartamento</h2>
            <form onSubmit={handleCrearApartamento} className="mt-5 space-y-4">
              <input required value={apartamentoForm.numero} onChange={(event) => setApartamentoForm({ ...apartamentoForm, numero: event.target.value })} placeholder="Número" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input required value={apartamentoForm.nombre_titular} onChange={(event) => setApartamentoForm({ ...apartamentoForm, nombre_titular: event.target.value })} placeholder="Nombre del titular" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input required value={apartamentoForm.piso} onChange={(event) => setApartamentoForm({ ...apartamentoForm, piso: event.target.value })} placeholder="Piso" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input required value={apartamentoForm.telefono_titular} onChange={(event) => setApartamentoForm({ ...apartamentoForm, telefono_titular: event.target.value })} placeholder="Teléfono del titular" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsApartamentoModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCargoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Añadir Cargo</h2>
            <form onSubmit={handleCrearCargo} className="mt-5 space-y-4">
              <select
                required
                value={cargoForm.mes}
                onChange={(event) => setCargoForm({ ...cargoForm, mes: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Selecciona el mes</option>
                <option value="Enero">Enero</option>
                <option value="Febrero">Febrero</option>
                <option value="Marzo">Marzo</option>
                <option value="Abril">Abril</option>
                <option value="Mayo">Mayo</option>
                <option value="Junio">Junio</option>
                <option value="Julio">Julio</option>
                <option value="Agosto">Agosto</option>
                <option value="Septiembre">Septiembre</option>
                <option value="Octubre">Octubre</option>
                <option value="Noviembre">Noviembre</option>
                <option value="Diciembre">Diciembre</option>
              </select>
              <input required value={cargoForm.concepto} onChange={(event) => setCargoForm({ ...cargoForm, concepto: event.target.value })} placeholder="Concepto" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input required min="0" step="0.01" type="number" value={cargoForm.monto} onChange={(event) => setCargoForm({ ...cargoForm, monto: event.target.value })} placeholder="Monto" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input required type="date" value={cargoForm.fecha_vencimiento} onChange={(event) => setCargoForm({ ...cargoForm, fecha_vencimiento: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCargoModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetalleModalOpen && apartamentoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Movimientos de {apartamentoDetalle.numero} — {apartamentoDetalle.nombre_titular}
            </h2>
            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
              {isLoadingDetalle ? (
                <p className="text-sm text-slate-500">Cargando movimientos...</p>
              ) : movimientosDetalle.length === 0 ? (
                <p className="text-sm text-slate-500">Este apartamento no tiene movimientos registrados.</p>
              ) : (
                movimientosDetalle.map((mov) => (
                  <div key={mov.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{mov.concepto} — {mov.mes}</p>
                      <p className="text-xs text-slate-500">${Number(mov.monto).toFixed(2)} · {mov.estado}</p>
                    </div>
                    {mov.estado === "Pendiente" && (
                      <button
                        type="button"
                        onClick={() => marcarComoPagado(mov.id, apartamentoDetalle.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Marcar como pagado
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetalleModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
