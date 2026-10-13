import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PASOS_RECORRIDO } from '../components/tour/pasos';
import { escucharTutorial } from '../utils/tutorial';

/** Una sola indicación de "presiona aquí" (la usa la Guía). */
export interface Pista {
  objetivo: string[];
  titulo: string;
  texto: string;
}

interface Estado {
  /** Ya vio (o cerró) la bienvenida. */
  bienvenidaVista: boolean;
  activo: boolean;
  paso: number;
  clienteId: string | null;
  terminado: boolean;
}

interface TutorialValor extends Estado {
  total: number;
  empezar: (clienteId: string | null) => void;
  saltarBienvenida: () => void;
  avanzar: () => void;
  cerrar: () => void;
  reiniciar: () => void;
  pista: Pista | null;
  mostrarPista: (p: Pista) => void;
  cerrarPista: () => void;
}

const TutorialContext = createContext<TutorialValor | null>(null);
const INICIAL: Estado = { bienvenidaVista: false, activo: false, paso: 0, clienteId: null, terminado: false };

/** Preferencia por visitante: si el almacenamiento no está disponible, el recorrido simplemente empieza de cero. */
function leer(clave: string): Estado {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo ? { ...INICIAL, ...(JSON.parse(crudo) as Partial<Estado>) } : INICIAL;
  } catch {
    return INICIAL;
  }
}

export function TutorialProvider({ children, usuarioId }: {children: ReactNode;usuarioId: string;}) {
  const clave = `cobrix-recorrido-${usuarioId}`;
  const [estado, setEstado] = useState<Estado>(() => leer(clave));
  const [pista, setPista] = useState<Pista | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(estado));
    } catch {
      /* modo privado: sin persistencia */
    }
  }, [clave, estado]);

  const avanzar = useCallback(
    () =>
    setEstado((e) => {
      if (!e.activo) return e;
      const siguiente = e.paso + 1;
      return siguiente >= PASOS_RECORRIDO.length ? { ...e, activo: false, terminado: true, paso: 0 } : { ...e, paso: siguiente };
    }),
    []
  );

  // Pasos que avanzan cuando el usuario completa una acción real.
  useEffect(
    () =>
    escucharTutorial((ev) =>
    setEstado((e) => {
      if (!e.activo) return e;
      const actual = PASOS_RECORRIDO[e.paso];
      if (actual?.avance.tipo !== 'evento' || actual.avance.evento !== ev) return e;
      const siguiente = e.paso + 1;
      return siguiente >= PASOS_RECORRIDO.length ? { ...e, activo: false, terminado: true, paso: 0 } : { ...e, paso: siguiente };
    })
    ),
    []
  );

  const empezar = useCallback((clienteId: string | null) => {
    setPista(null);
    setEstado((e) => ({ ...e, bienvenidaVista: true, activo: true, paso: 0, clienteId }));
  }, []);
  const saltarBienvenida = useCallback(() => setEstado((e) => ({ ...e, bienvenidaVista: true, activo: false })), []);
  const cerrar = useCallback(() => setEstado((e) => ({ ...e, activo: false })), []);
  const reiniciar = useCallback(() => setEstado((e) => ({ ...e, bienvenidaVista: false, activo: false, paso: 0 })), []);
  const mostrarPista = useCallback((p: Pista) => setPista(p), []);
  const cerrarPista = useCallback(() => setPista(null), []);

  const valor = useMemo<TutorialValor>(
    () => ({ ...estado, total: PASOS_RECORRIDO.length, empezar, saltarBienvenida, avanzar, cerrar, reiniciar, pista, mostrarPista, cerrarPista }),
    [estado, empezar, saltarBienvenida, avanzar, cerrar, reiniciar, pista, mostrarPista, cerrarPista]
  );

  return <TutorialContext.Provider value={valor}>{children}</TutorialContext.Provider>;
}

export function useTutorial(): TutorialValor {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial debe usarse dentro de TutorialProvider');
  return ctx;
}
