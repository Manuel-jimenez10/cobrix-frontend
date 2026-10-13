import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DatabaseIcon, SearchIcon, SparklesIcon } from 'lucide-react';
import { avisarTutorial } from '../utils/tutorial';
import { toast } from 'sonner';
import { ClienteRow } from '../components/cartera/ClienteRow';
import { ClienteSwipeCard } from '../components/cartera/ClienteSwipeCard';
import { ConfirmarPagoDialog } from '../components/cartera/ConfirmarPagoDialog';
import { FiltrosBar } from '../components/cartera/FiltrosBar';
import { ClienteDetalle } from '../components/cliente/ClienteDetalle';
import { FabCobranza } from '../components/layout/FabCobranza';
import { MobileHeader } from '../components/layout/MobileHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Money } from '../components/ui/Money';
import { Skeleton } from '../components/ui/Skeleton';
import { useCobranza } from '../contexts/CobranzaContext';
import { useUI } from '../contexts/UIContext';
import { useEsEscritorio } from '../hooks/useMediaQuery';
import * as api from '../services/api';
import type { ClienteResumen } from '../types/cobranza';
import { EASE_OUT } from '../utils/motion';

function ListaSkeleton() {
  return (
    <div className="space-y-2 p-4" aria-busy="true" aria-label="Cargando clientes">
      {Array.from({ length: 6 }).map((_, i) =>
      <Skeleton key={i} className="h-[92px] w-full rounded-2xl" />
      )}
    </div>);

}

export function Cartera() {
  const { id } = useParams();
  useEffect(() => avisarTutorial('cartera'), []);
  const escritorio = useEsEscritorio();
  const navigate = useNavigate();
  const { clientes: todos, cargando, version, cargarEjemplo } = useCobranza();
  const { abrirCobranza, filtrosCartera: filtros, setFiltrosCartera: setFiltros, setPaletaAbierta } = useUI();
  const [lista, setLista] = useState<ClienteResumen[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [pagoId, setPagoId] = useState<string | null>(null);
  const [cargandoEjemplo, setCargandoEjemplo] = useState(false);
  const autoSeleccion = useRef(false);

  useEffect(() => {
    let vivo = true;
    setBuscando(true);
    const t = setTimeout(
      async () => {
        try {
          const r = await api.getClientes(filtros);
          if (vivo) setLista(r);
        } finally {
          if (vivo) setBuscando(false);
        }
      },
      filtros.busqueda ? 180 : 0
    );
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [filtros, version, todos]);

  useEffect(() => {
    if (escritorio && !id && lista?.length && !autoSeleccion.current) {
      autoSeleccion.current = true;
      navigate(`/cartera/${lista[0].id}`, { replace: true });
    }
  }, [escritorio, id, lista, navigate]);

  const sinDatos = !cargando && todos.length === 0;
  const total = todos.reduce((s, c) => s + c.deuda, 0);
  const hayFiltros = Boolean(filtros.busqueda) || filtros.estado !== 'todos' || filtros.prioridad !== 'todas';

  const cargar = async () => {
    setCargandoEjemplo(true);
    try {
      await cargarEjemplo();
      toast.success('Datos de ejemplo cargados', { description: '15 clientes listos para cobrar.' });
    } finally {
      setCargandoEjemplo(false);
    }
  };

  const estadoVacio =
  <EmptyState
    ilustracion="cartera"
    titulo="Tu cartera está vacía"
    descripcion="Carga clientes de ejemplo para ver a los agentes priorizar, escribir y negociar en tiempo real."
    accion={
    <Button variante="primario" icono={DatabaseIcon} onClick={cargar} disabled={cargandoEjemplo}>
          {cargandoEjemplo ? 'Cargando…' : 'Cargar datos de ejemplo'}
        </Button>
    } />;



  const sinResultados =
  <EmptyState
    ilustracion="seleccion"
    titulo="Sin resultados"
    descripcion="Ningún cliente coincide con la búsqueda o los filtros."
    accion={
    <Button variante="secundario" onClick={() => setFiltros({ busqueda: '', estado: 'todos', prioridad: 'todas', orden: filtros.orden })}>
          Limpiar filtros
        </Button>
    } />;



  // Móvil: detalle a pantalla completa, con gesto para volver.
  if (!escritorio && id) {
    return (
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.5 }}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (info.offset.x > 110 || info.velocity.x > 600) navigate('/cartera');
        }}
        className="flex h-[100dvh] flex-col bg-bg">
        
        <ClienteDetalle id={id} modo="pantalla" />
      </motion.div>);

  }

  if (!escritorio) {
    return (
      <div className="pb-[calc(150px+env(safe-area-inset-bottom))]">
        <MobileHeader
          titulo="Cartera"
          subtitulo={
          todos.length > 0 &&
          <>
                {todos.length} clientes · <Money valor={total} className="text-fg" /> por cobrar
              </>

          }
          acciones={
          <IconButton aria-label="Buscar en todo" onClick={() => setPaletaAbierta(true)}>
              <SearchIcon size={19} />
            </IconButton>
          } />
        
        {sinDatos ?
        estadoVacio :

        <>
            <div className="sticky top-[calc(48px+env(safe-area-inset-top))] z-20 border-b border-line bg-bg/90 px-4 pb-3 pt-1 backdrop-blur-xl">
              <FiltrosBar filtros={filtros} onChange={setFiltros} />
            </div>
            {!lista ?
          <ListaSkeleton /> :
          lista.length === 0 ?
          sinResultados :

          <>
                <p className="px-4 pb-2 pt-3 text-xs text-muted">Desliza una tarjeta: → cobrar con IA · ← marcar pagada</p>
                <motion.ul
              className="space-y-2 px-4 transition-opacity duration-150"
              style={{ opacity: buscando ? 0.6 : 1 }}
              initial="oculto"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
              
                  {lista.map((c) =>
              <motion.li key={c.id} layout="position" variants={{ oculto: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.22, ease: EASE_OUT }}>
                      <ClienteSwipeCard cliente={c} onAbrir={() => navigate(`/cartera/${c.id}`)} onCobrar={() => abrirCobranza([c.id])} onPagada={() => setPagoId(c.id)} />
                    </motion.li>
              )}
                </motion.ul>
              </>
          }
            <FabCobranza />
          </>
        }
        <ConfirmarPagoDialog clienteId={pagoId} onCerrar={() => setPagoId(null)} />
      </div>);

  }

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-line px-6">
        <h1 className="text-lg font-semibold tracking-tight">Cartera</h1>
        {todos.length > 0 &&
        <span className="text-sm text-muted">
            {todos.length} clientes · <Money valor={total} className="text-fg" /> por cobrar
          </span>
        }
        <div className="ml-auto">
          <Button variante="primario" icono={SparklesIcon} onClick={() => abrirCobranza()} disabled={sinDatos}>
            Iniciar cobranza con IA
          </Button>
        </div>
      </header>
      {sinDatos ?
      <div className="grid flex-1 place-items-center">{estadoVacio}</div> :

      <div className="grid min-h-0 flex-1 grid-cols-[400px_minmax(0,1fr)] xl:grid-cols-[440px_minmax(0,1fr)]">
          <section aria-label="Lista de clientes" className="flex min-h-0 flex-col border-r border-line">
            <div className="border-b border-line p-4">
              <FiltrosBar filtros={filtros} onChange={setFiltros} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {!lista ?
            <ListaSkeleton /> :
            lista.length === 0 ?
            sinResultados :

            <motion.ul className="divide-y divide-line transition-opacity duration-150" style={{ opacity: buscando ? 0.6 : 1 }}>
                  <AnimatePresence initial={false}>
                    {lista.map((c) =>
                <ClienteRow key={c.id} cliente={c} activo={c.id === id} onSeleccionar={() => navigate(`/cartera/${c.id}`)} />
                )}
                  </AnimatePresence>
                </motion.ul>
            }
            </div>
          </section>
          <section aria-label="Detalle del cliente" className="h-full min-h-0 overflow-hidden">
            {id ?
          <ClienteDetalle key={id} id={id} modo="panel" /> :

          <EmptyState ilustracion="seleccion" titulo="Selecciona un cliente" descripcion="Verás sus facturas, la conversación y por qué el Analista lo priorizó." className="h-full" />
          }
          </section>
        </div>
      }
    </div>);

}