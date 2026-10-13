import React, { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../services/api';
import { usaDatosMock } from '../utils/env';
import { avisarTutorial } from '../utils/tutorial';
import type { OpcionesCobranza } from '../services/api';
import type {
  Canal,
  ClienteResumen,
  Dashboard,
  EventoAgente,
  PromesaConCliente,
  ResultadoCobranza } from
'../types/cobranza';

interface CobranzaValor {
  clientes: ClienteResumen[];
  dashboard: Dashboard | null;
  promesas: PromesaConCliente[];
  eventos: EventoAgente[];
  canal: Canal;
  cargando: boolean;
  error: string | null;
  /** Aumenta tras cada mutación para que las vistas de detalle se refresquen. */
  version: number;
  recargar: () => Promise<void>;
  refrescarSilencioso: () => Promise<void>;
  iniciar: (clienteIds: string[], opciones?: OpcionesCobranza) => Promise<ResultadoCobranza>;
  marcarPagada: (clienteId: string) => Promise<number>;
  cumplirPromesa: (promesaId: string) => Promise<void>;
  cargarEjemplo: () => Promise<void>;
  vaciar: () => Promise<void>;
  cambiarCanal: (canal: Canal) => Promise<void>;
}

const CobranzaContext = createContext<CobranzaValor | null>(null);

export function CobranzaProvider({ children, iniciarVacio = false }: {children: ReactNode;iniciarVacio?: boolean;}) {
  const [clientes, setClientes] = useState<ClienteResumen[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [promesas, setPromesas] = useState<PromesaConCliente[]>([]);
  const [eventos, setEventos] = useState<EventoAgente[]>([]);
  const [canal, setCanal] = useState<Canal>('whatsapp');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const refrescoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const montado = useRef(false);

  const refrescarSilencioso = useCallback(async () => {
    try {
      const [d, c, p] = await Promise.all([api.getDashboard(), api.getClientes(), api.getPromesas()]);
      setDashboard(d);
      setClientes(c);
      setPromesas(p);
    } catch {

      // El siguiente refresco lo reintentará.
    }}, []);

  const recargar = useCallback(async () => {
    setError(null);
    try {
      const [d, c, p, e, a] = await Promise.all([
      api.getDashboard(),
      api.getClientes(),
      api.getPromesas(),
      api.getEventosAgente(),
      api.getAjustes()]
      );
      setDashboard(d);
      setClientes(c);
      setPromesas(p);
      setEventos(e);
      setCanal(a.canal);
    } catch {
      setError('No pudimos cargar tu cartera. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    (async () => {
      // Solo en modo demo local se reinician los datos mock. Con backend real, la cartera es persistente.
      if (usaDatosMock) {
        if (iniciarVacio) await api.vaciarDatos();else
        if (montado.current) await api.cargarDatosEjemplo();
      }
      montado.current = true;
      if (activo) {
        await recargar();
        setVersion((v) => v + 1);
      }
    })();
    return () => {
      activo = false;
    };
  }, [iniciarVacio, recargar]);

  useEffect(
    () =>
    api.suscribirEventos((ev) => {
      setEventos((prev) => {
        const i = prev.findIndex((x) => x.id === ev.id);
        if (i >= 0) {
          const copia = [...prev];
          copia[i] = ev;
          return copia;
        }
        return [ev, ...prev].slice(0, 80);
      });
      if (ev.estado !== 'en_progreso') {
        if (refrescoRef.current) clearTimeout(refrescoRef.current);
        refrescoRef.current = setTimeout(() => void refrescarSilencioso(), 700);
      }
    }),
    [refrescarSilencioso]
  );

  const despuesDeMutar = useCallback(async () => {
    await refrescarSilencioso();
    setVersion((v) => v + 1);
  }, [refrescarSilencioso]);

  const iniciar = useCallback(
    async (ids: string[], opciones?: OpcionesCobranza) => {
      const r = await api.iniciarCobranza(ids, opciones);
      avisarTutorial('cobranza');
      await despuesDeMutar();
      return r;
    },
    [despuesDeMutar]
  );

  const marcarPagada = useCallback(
    async (id: string) => {
      const monto = await api.marcarPagada(id);
      await despuesDeMutar();
      return monto;
    },
    [despuesDeMutar]
  );

  const cumplirPromesa = useCallback(
    async (id: string) => {
      await api.cumplirPromesa(id);
      await despuesDeMutar();
    },
    [despuesDeMutar]
  );

  const cargarEjemplo = useCallback(async () => {
    await api.cargarDatosEjemplo();
    await recargar();
    setVersion((v) => v + 1);
  }, [recargar]);

  const vaciar = useCallback(async () => {
    await api.vaciarDatos();
    await recargar();
    setVersion((v) => v + 1);
  }, [recargar]);

  const cambiarCanal = useCallback(async (nuevo: Canal) => {
    setCanal(nuevo);
    await api.actualizarCanal(nuevo);
  }, []);

  const valor = useMemo<CobranzaValor>(
    () => ({
      clientes,
      dashboard,
      promesas,
      eventos,
      canal,
      cargando,
      error,
      version,
      recargar,
      refrescarSilencioso,
      iniciar,
      marcarPagada,
      cumplirPromesa,
      cargarEjemplo,
      vaciar,
      cambiarCanal
    }),
    [clientes, dashboard, promesas, eventos, canal, cargando, error, version, recargar, refrescarSilencioso, iniciar, marcarPagada, cumplirPromesa, cargarEjemplo, vaciar, cambiarCanal]
  );

  return <CobranzaContext.Provider value={valor}>{children}</CobranzaContext.Provider>;
}

export function useCobranza(): CobranzaValor {
  const ctx = useContext(CobranzaContext);
  if (!ctx) throw new Error('useCobranza debe usarse dentro de CobranzaProvider');
  return ctx;
}