import React from 'react';
import { Link } from 'react-router-dom';
import { SendIcon, SettingsIcon } from 'lucide-react';
import { AgentsRow } from '../components/dashboard/AgentsRow';
import { AgingChart } from '../components/dashboard/AgingChart';
import { KpiGrid } from '../components/dashboard/KpiGrid';
import { LiveAgentsFeed } from '../components/dashboard/LiveAgentsFeed';
import { PorAtender } from '../components/dashboard/PorAtender';
import { PrioridadHoy } from '../components/dashboard/PrioridadHoy';
import { FabCobranza } from '../components/layout/FabCobranza';
import { MobileHeader } from '../components/layout/MobileHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useCobranza } from '../contexts/CobranzaContext';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { useEsEscritorio } from '../hooks/useMediaQuery';
import { formatMXN, saludoPorHora } from '../utils/format';
import { teclaMod } from '../utils/motion';

function Resumen() {
  const { dashboard } = useCobranza();
  if (!dashboard) return <Skeleton className="h-5 w-80 max-w-full" />;
  if (dashboard.porCobrar === 0) return <p className="text-[15px] text-muted">Tu cartera está vacía o al día. Carga clientes para empezar a cobrar.</p>;
  const tareas = Object.values(dashboard.tareasHoy).reduce((s, n) => s + n, 0);
  return (
    <p className="text-[15px] leading-relaxed text-muted">
      {dashboard.vencido > 0 ?
      <>
          Tienes <strong className="font-semibold tabular-nums text-fg">{formatMXN(dashboard.vencido)}</strong> vencidos en{' '}
          <strong className="font-semibold text-fg">{dashboard.clientesVencidos} clientes</strong>.
        </> :

      'No tienes saldo vencido.'
      }{' '}
      Se completaron <span className="tabular-nums">{tareas}</span> tareas hoy.
    </p>);

}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando panel">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>);

}

export function Inicio() {
  const { dashboard, eventos, clientes, cargando, error, recargar } = useCobranza();
  const { abrirCobranza, setDirectorAbierto, setPaletaAbierta } = useUI();
  const escritorio = useEsEscritorio();
  const { perfil } = useAuth();
  const nombre = perfil?.nombre.split(' ')[0];
  const saludo = nombre && nombre !== 'Invitado' ? `${saludoPorHora()}, ${nombre}` : saludoPorHora();

  if (error) {
    return (
      <EmptyState
        ilustracion="error"
        titulo="No pudimos cargar tu panel"
        descripcion={error}
        accion={<Button onClick={() => void recargar()}>Reintentar</Button>}
        className="min-h-[100dvh]" />);


  }

  const contenido =
  cargando || !dashboard ?
  <DashboardSkeleton /> :

  <div className="space-y-6">
        <KpiGrid dashboard={dashboard} />
        <AgentsRow eventos={eventos} tareasHoy={dashboard.tareasHoy} porAtender={clientes.filter((c) => c.requiereAtencion).length} />
        <PorAtender clientes={clientes} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PrioridadHoy clientes={clientes} />
          <AgingChart tramos={dashboard.antiguedad} />
        </div>
      </div>;


  if (escritorio) {
    return (
      <div className="grid min-h-[100dvh] grid-cols-[minmax(0,1fr)_360px]">
        <div className="px-8 py-8 xl:px-10">
          <div className="mx-auto max-w-5xl">
            <header className="mb-8 flex items-end justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-[28px] font-semibold tracking-tight">{saludo}</h1>
                <div className="mt-1.5">
                  <Resumen />
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variante="secundario" onClick={() => setDirectorAbierto(true)}>
                  Preguntar al Director
                </Button>
                <Button variante="primario" icono={SendIcon} onClick={() => abrirCobranza()}>
                  Iniciar cobranza
                </Button>
              </div>
            </header>
            {contenido}
            <p className="mt-8 text-xs text-muted">
              Atajos: <span className="tabular-nums">{teclaMod()}K</span> para buscar · <span className="tabular-nums">{teclaMod()}J</span> para hablar con el Director
            </p>
          </div>
        </div>
        <aside className="sticky top-0 flex h-[100dvh] flex-col border-l border-line bg-surface/40">
          <LiveAgentsFeed eventos={eventos} cargando={cargando} className="h-full" />
        </aside>
      </div>);

  }

  return (
    <div className="pb-[calc(150px+env(safe-area-inset-bottom))]">
      <MobileHeader
        titulo={saludo}
        subtitulo={<Resumen />}
        acciones={
        <>
            <Button variante="fantasma" tamano="sm" onClick={() => setPaletaAbierta(true)} className="px-3">
              Buscar
            </Button>
            <Link to="/ajustes" aria-label="Ajustes" className="grid h-11 w-11 place-items-center rounded-lg text-muted hover:text-fg">
              <SettingsIcon size={19} />
            </Link>
          </>
        } />
      
      <div className="space-y-6 px-4">
        {contenido}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <LiveAgentsFeed eventos={eventos} limite={6} cargando={cargando} />
        </div>
      </div>
      <FabCobranza />
    </div>);

}