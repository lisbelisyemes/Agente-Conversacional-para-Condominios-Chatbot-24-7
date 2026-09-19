"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

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

type BadgeTone = "green" | "amber" | "red" | "blue" | "gray";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("Resumen");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

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
      if (!data.session) {
        router.push('/login');
      } else {
        setAdminEmail(data.session.user.email ?? null);
      }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // ---- Renderizado de la barra lateral (escritorio y drawer móvil) ----
  const renderSidebar = () => (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-5 pb-6 pt-7">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-brand-50 shadow-inner" aria-hidden="true">
          <IconBuilding className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-white">Condominio Inteligente</p>
          <p className="text-xs text-brand-400">Portal administrativo</p>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3" aria-label="Navegación principal">
        {sections.map((section) => {
          const isActive = activeSection === section;
          return (
            <button
              key={section}
              type="button"
              onClick={() => {
                setActiveSection(section);
                setIsMobileMenuOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                isActive
                  ? "bg-brand-700/80 text-white shadow-sm"
                  : "text-brand-200/80 hover:bg-white/5 hover:text-white"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={isActive ? "text-brand-100" : "text-brand-400"} aria-hidden="true">
                {sectionIcon(section)}
              </span>
              {section}
            </button>
          );
        })}
      </nav>

      <div className="space-y-4 px-3 pb-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/connie.png"
              alt="Connie, asistente virtual de Condominio Inteligente"
              width={1280}
              height={1280}
              sizes="44px"
              className="size-11 rounded-xl object-cover ring-2 ring-brand-400/40"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">Connie</p>
              <p className="text-xs text-brand-400">Asistente 24/7</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">
            Atiende a los residentes por WhatsApp y mantiene la operación del condominio al día.
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            Disponible 24/7
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
        >
          <IconLogout className="size-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  // Funciones de renderizado para mantener el código limpio
  const renderResumen = () => {
    const deudaTotal = apartamentos.reduce((acc, apto) => acc + Number(apto.saldo_pendiente || 0), 0);
    const reportesPendientes = reportes.length;
    const aptosConDeuda = apartamentos.filter((apto) => Number(apto.saldo_pendiente || 0) > 0).length;
    const aptosSolventes = apartamentos.length - aptosConDeuda;

    return (
      <>
        <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm sm:p-8">
          <p className="text-xs font-semibold text-blue-700 sm:text-sm">Resumen</p>
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-brand-950 sm:mt-2 sm:text-3xl">Todo está en orden.</h2>
          <p className="mt-1.5 text-sm text-slate-500 sm:mt-2">Monitorea la operación diaria de tu condominio desde un solo lugar.</p>
        </div>

        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3" aria-label="Indicadores principales">
          <StatCard label="Deuda Total Activa" value={`$${deudaTotal.toFixed(2)}`} tone="red" icon={<IconMoney className="size-5" />} hint="Suma de saldos pendientes" />
          <StatCard label="Incidencias Pendientes" value={String(reportesPendientes)} tone="amber" icon={<IconAlert className="size-5" />} hint="Esperando resolución" />
          <StatCard label="Estado del Bot" value="En línea" tone="green" icon={<IconBot className="size-5" />} hint="Connie atendiendo 24/7" />
          <StatCard label="Apartamentos Registrados" value={String(apartamentos.length)} tone="blue" icon={<IconGrid className="size-5" />} hint="Total en el condominio" />
          <StatCard label="Apartamentos Solventes" value={String(aptosSolventes)} tone="green" icon={<IconCheck className="size-5" />} hint="Sin deuda pendiente" />
          <StatCard label="Apartamentos con Deuda" value={String(aptosConDeuda)} tone="red" icon={<IconUsers className="size-5" />} hint="Requieren cobro" />
        </section>
      </>
    );
  };

  const renderReglamento = () => (
    <section className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
      <div className="border-b border-brand-100 px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="text-lg font-bold text-brand-950">Reglamento Interno Base</h2>
        <p className="mt-1 text-sm text-slate-500">Fragmentos ingeridos por el asistente conversacional para responder a residentes.</p>
      </div>
      <div className="divide-y divide-brand-100/70">
        {isLoading ? (
          <p className="px-4 py-8 text-sm text-slate-500 sm:px-6"><InlineLoader text="Cargando reglamento..." /></p>
        ) : reglamento.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500 sm:px-6">No hay artículos disponibles.</p>
        ) : reglamento.map((regla) => (
          <div key={regla.id} className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-6">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-800">
              {regla.pagina}
            </span>
            <p className="text-sm leading-relaxed text-slate-700">{regla.contenido}</p>
          </div>
        ))}
      </div>
    </section>
  );

  const renderEstadosDeCuenta = () => (
    <section className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-brand-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div>
          <h2 className="text-lg font-bold text-brand-950">Saldos por Apartamento</h2>
          <p className="mt-1 text-sm text-slate-500">Control de morosidad y cuentas por cobrar.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsApartamentoModalOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <IconPlus className="size-4" />
          Añadir Apartamento
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm text-slate-600">
          <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-800">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold sm:px-6">Apto</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Titular</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Estado</th>
              <th scope="col" className="px-5 py-3.5 text-right font-semibold">Saldo Pendiente</th>
              <th scope="col" className="px-5 py-3.5 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100/70 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                  <InlineLoader text="Cargando cuentas..." />
                </td>
              </tr>
            ) : apartamentos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                  No hay apartamentos registrados.
                </td>
              </tr>
            ) : apartamentos.map((apto) => (
              <tr key={apto.id} className="transition-colors hover:bg-brand-50/40">
                <td className="px-5 py-4 font-bold text-brand-950 sm:px-6">{apto.numero}</td>
                <td className="px-5 py-4">{apto.nombre_titular || 'Sin registrar'}</td>
                <td className="px-5 py-4">
                  <StatusBadge tone={apto.saldo_pendiente > 0 ? "red" : "green"}>
                    {apto.saldo_pendiente > 0 ? "Con Deuda" : "Solvente"}
                  </StatusBadge>
                </td>
                <td className="px-5 py-4 text-right font-semibold text-brand-950">
                  ${Number(apto.saldo_pendiente).toFixed(2)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => abrirDetalleApartamento(apto)}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-brand-300 px-3 py-2 text-xs font-semibold text-brand-800 transition hover:bg-brand-50"
                    >
                      <IconEye className="size-3.5" />
                      Ver movimientos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setApartamentoSeleccionado(apto.id);
                        setIsCargoModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-800"
                    >
                      <IconPlus className="size-3.5" />
                      Añadir Cargo
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderIncidencias = () => (
    <section className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
      <div className="border-b border-brand-100 px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="text-lg font-bold text-brand-950">Historial de Incidencias</h2>
        <p className="mt-1 text-sm text-slate-500">Reportes generados por los residentes mediante WhatsApp.</p>
      </div>
      <div className="divide-y divide-brand-100/70">
        {isLoading ? (
          <p className="px-4 py-8 text-sm text-slate-500 sm:px-6"><InlineLoader text="Cargando incidencias..." /></p>
        ) : reportes.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500 sm:px-6">No hay reportes registrados.</p>
        ) : reportes.map((reporte) => {
          const fechaFormateada = new Date(reporte.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

          return (
            <div key={reporte.id} className={`flex flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-6 ${reporte.urgente ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-brand-50/40"}`}>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {reporte.urgente && (
                    <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      Urgente
                    </span>
                  )}
                  <p className="font-semibold text-slate-800">{reporte.descripcion}</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <IconPin className="size-3.5" />
                    {reporte.ubicacion}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <IconCalendar className="size-3.5" />
                    {fechaFormateada}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <IconPhone className="size-3.5" />
                    {reporte.telefono_reporta}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={estadoTone(reporte.estado)}>{reporte.estado}</StatusBadge>
                {reporte.estado !== "Resuelto" && (
                  <>
                    <button
                      type="button"
                      onClick={() => actualizarEstadoReporte(reporte.id, "Asignado")}
                      className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                      Asignar
                    </button>
                    <button
                      type="button"
                      onClick={() => actualizarEstadoReporte(reporte.id, "Resuelto")}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
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
    <main className="min-h-screen bg-brand-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-r border-brand-800 bg-brand-950 lg:flex">
          {renderSidebar()}
        </aside>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-brand-950/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-brand-950 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="text-sm font-bold text-white">Menú</p>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="grid size-9 place-items-center rounded-lg text-brand-200 transition hover:bg-white/10"
                  aria-label="Cerrar menú"
                >
                  <IconX className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{renderSidebar()}</div>
            </div>
          </div>
        )}

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="shrink-0 border-b border-brand-100 bg-white/90 px-3 py-3 backdrop-blur sm:px-8 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="grid size-9 shrink-0 place-items-center rounded-xl border border-brand-100 text-brand-800 transition hover:bg-brand-50 sm:size-10 lg:hidden"
                  aria-label="Abrir menú de navegación"
                >
                  <IconMenu className="size-5" />
                </button>
                <div className="min-w-0">
                  <p className="hidden text-xs font-semibold uppercase tracking-widest text-brand-700 sm:block">Panel administrativo</p>
                  <h1 className="truncate text-lg font-bold tracking-tight text-brand-950 sm:mt-0.5 sm:text-2xl">{activeSection}</h1>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 sm:inline-flex">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  Sistema en línea
                </span>
                <span
                  className="grid size-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-800 sm:size-10"
                  title={adminEmail ?? "Administrador"}
                  aria-label={adminEmail ?? "Administrador"}
                >
                  {adminEmail ? adminEmail.slice(0, 2).toUpperCase() : "AD"}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="grid size-9 place-items-center rounded-xl border border-brand-100 text-brand-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:size-10 lg:hidden"
                  aria-label="Cerrar sesión"
                >
                  <IconLogout className="size-4" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
              {activeSection === "Resumen" && renderResumen()}
              {activeSection === "Reglamento" && renderReglamento()}
              {activeSection === "Estados de cuenta" && renderEstadosDeCuenta()}
              {activeSection === "Incidencias" && renderIncidencias()}
            </div>
          </div>
        </section>
      </div>

      {isApartamentoModalOpen && (
        <Modal title="Añadir Apartamento" onClose={() => setIsApartamentoModalOpen(false)}>
          <form onSubmit={handleCrearApartamento} className="space-y-4">
            <input required value={apartamentoForm.numero} onChange={(event) => setApartamentoForm({ ...apartamentoForm, numero: event.target.value })} placeholder="Número" className={inputClass} />
            <input required value={apartamentoForm.nombre_titular} onChange={(event) => setApartamentoForm({ ...apartamentoForm, nombre_titular: event.target.value })} placeholder="Nombre del titular" className={inputClass} />
            <input required value={apartamentoForm.piso} onChange={(event) => setApartamentoForm({ ...apartamentoForm, piso: event.target.value })} placeholder="Piso" className={inputClass} />
            <input required value={apartamentoForm.telefono_titular} onChange={(event) => setApartamentoForm({ ...apartamentoForm, telefono_titular: event.target.value })} placeholder="Teléfono del titular" className={inputClass} />
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setIsApartamentoModalOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">Guardar</button>
            </div>
          </form>
        </Modal>
      )}

      {isCargoModalOpen && (
        <Modal title="Añadir Cargo" onClose={() => setIsCargoModalOpen(false)}>
          <form onSubmit={handleCrearCargo} className="space-y-4">
            <select
              required
              value={cargoForm.mes}
              onChange={(event) => setCargoForm({ ...cargoForm, mes: event.target.value })}
              className={inputClass}
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
            <input required value={cargoForm.concepto} onChange={(event) => setCargoForm({ ...cargoForm, concepto: event.target.value })} placeholder="Concepto" className={inputClass} />
            <input required min="0" step="0.01" type="number" value={cargoForm.monto} onChange={(event) => setCargoForm({ ...cargoForm, monto: event.target.value })} placeholder="Monto" className={inputClass} />
            <input required type="date" value={cargoForm.fecha_vencimiento} onChange={(event) => setCargoForm({ ...cargoForm, fecha_vencimiento: event.target.value })} className={inputClass} />
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setIsCargoModalOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">Guardar</button>
            </div>
          </form>
        </Modal>
      )}

      {isDetalleModalOpen && apartamentoDetalle && (
        <Modal title={`Movimientos de ${apartamentoDetalle.numero} — ${apartamentoDetalle.nombre_titular}`} onClose={() => setIsDetalleModalOpen(false)} maxWidth="max-w-lg">
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {isLoadingDetalle ? (
              <p className="text-sm text-slate-500"><InlineLoader text="Cargando movimientos..." /></p>
            ) : movimientosDetalle.length === 0 ? (
              <p className="text-sm text-slate-500">Este apartamento no tiene movimientos registrados.</p>
            ) : (
              movimientosDetalle.map((mov) => (
                <div key={mov.id} className="flex flex-col gap-2 rounded-xl border border-brand-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-950">{mov.concepto} — {mov.mes}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-brand-800">${Number(mov.monto).toFixed(2)}</span>
                      <StatusBadge tone={mov.estado === "Pagado" ? "green" : mov.estado === "Pendiente" ? "amber" : "gray"} dot={false}>
                        {mov.estado}
                      </StatusBadge>
                    </div>
                  </div>
                  {mov.estado === "Pendiente" && (
                    <button
                      type="button"
                      onClick={() => marcarComoPagado(mov.id, apartamentoDetalle.id)}
                      className="self-start rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:self-auto"
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
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

// ---- Utilidades y componentes visuales auxiliares ----

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

const estadoTone = (estado: string): BadgeTone => {
  if (estado === "Pendiente") return "amber";
  if (estado === "Asignado") return "blue";
  if (estado === "Resuelto") return "green";
  return "gray";
};

const sectionIcon = (section: string) => {
  const className = "size-4";
  switch (section) {
    case "Resumen":
      return <IconGrid className={className} />;
    case "Reglamento":
      return <IconBook className={className} />;
    case "Estados de cuenta":
      return <IconWallet className={className} />;
    case "Incidencias":
      return <IconAlert className={className} />;
    default:
      return <IconGrid className={className} />;
  }
};

const InlineLoader = ({ text }: { text: string }) => (
  <span className="inline-flex items-center gap-2">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" opacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
    </svg>
    {text}
  </span>
);

const Modal = ({
  title,
  onClose,
  children,
  maxWidth = "max-w-md",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-brand-950/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
    <div className={`my-auto w-full ${maxWidth} max-h-[92vh] overflow-y-auto rounded-2xl border border-brand-100 bg-white p-5 shadow-2xl sm:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-bold text-brand-950">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Cerrar"
        >
          <IconX className="size-4" />
        </button>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  </div>
);

// ---- Iconos SVG inline (sin dependencias adicionales) ----

type IconProps = { className?: string };

const IconGrid = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
);

const IconBook = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M12 6.2C10.3 5 8.2 4.2 5.5 4.2c-.6 0-1 .4-1 1v12.6c0 .6.4 1 1 1 2.7 0 4.8.8 6.5 2 1.7-1.2 3.8-2 6.5-2 .6 0 1-.4 1-1V5.2c0-.6-.4-1-1-1-2.7 0-4.8.8-6.5 2Z" />
    <path d="M12 6.2v13.6" />
  </svg>
);

const IconWallet = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="3.5" y="6.5" width="17" height="12" rx="2.5" />
    <path d="M3.5 10h17" />
    <circle cx="16.5" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

const IconAlert = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M12 3.5 2.5 20h19L12 3.5Z" />
    <path d="M12 10v4.5M12 17.5h.01" />
  </svg>
);

const IconLogout = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const IconBuilding = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    <path d="M9 21v-4h6v4M9 8h.01M15 8h.01M9 12h.01M15 12h.01" />
  </svg>
);

const IconUsers = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M15.5 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconCheck = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </svg>
);

const IconMoney = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="3" y="7" width="18" height="12" rx="2.5" />
    <circle cx="12" cy="13" r="2.5" />
    <path d="M6.5 11v.01M17.5 15v.01" />
  </svg>
);

const IconBot = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="4.5" y="9" width="15" height="10" rx="3" />
    <path d="M12 6v3M9.5 12.5h.01M14.5 12.5h.01M9.5 16h5" />
  </svg>
);

const IconPlus = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconEye = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

const IconMenu = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const IconX = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const IconPin = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M12 21s-7-5.2-7-10.5a7 7 0 0 1 14 0C19 15.8 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2.5" />
  </svg>
);

const IconCalendar = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

const IconPhone = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);