import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { escucharTutorial, type PasoTutorial } from '../utils/tutorial';

export const PASOS: PasoTutorial[] = ['cartera', 'director', 'cobranza', 'negociar', 'politicas'];

interface Estado {
  completados: PasoTutorial[];
  /** Ya vio (o cerró) la bienvenida. */
  bienvenidaVista: boolean;
  /** El recorrido está activo (tarjeta visible). */
  activo: boolean;
  minimizado: boolean;
}

interface TutorialValor extends Estado {
  completado: (p: PasoTutorial) => boolean;
  terminado: boolean;
  empezar: () => void;
  saltar: () => void;
  cerrar: () => void;
  reiniciar: () => void;
  setMinimizado: (v: boolean) => void;
}

const TutorialContext = createContext<TutorialValor | null>(null);

const INICIAL: Estado = { completados: [], bienvenidaVista: false, activo: false, minimizado: false };

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
  const clave = `cobrix-tutorial-${usuarioId}`;
  const [estado, setEstado] = useState<Estado>(() => leer(clave));

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(estado));
    } catch {
      /* modo privado: sin persistencia */
    }
  }, [clave, estado]);

  useEffect(
    () =>
    escucharTutorial((paso) =>
    setEstado((e) => e.completados.includes(paso) ? e : { ...e, completados: [...e.completados, paso] })
    ),
    []
  );

  const completado = useCallback((p: PasoTutorial) => estado.completados.includes(p), [estado.completados]);
  const empezar = useCallback(() => setEstado((e) => ({ ...e, bienvenidaVista: true, activo: true, minimizado: false })), []);
  const saltar = useCallback(() => setEstado((e) => ({ ...e, bienvenidaVista: true, activo: false })), []);
  const cerrar = useCallback(() => setEstado((e) => ({ ...e, activo: false })), []);
  const reiniciar = useCallback(() => setEstado({ ...INICIAL, bienvenidaVista: true, activo: true }), []);
  const setMinimizado = useCallback((v: boolean) => setEstado((e) => ({ ...e, minimizado: v })), []);

  const valor = useMemo<TutorialValor>(
    () => ({
      ...estado,
      completado,
      terminado: PASOS.every((p) => estado.completados.includes(p)),
      empezar,
      saltar,
      cerrar,
      reiniciar,
      setMinimizado
    }),
    [estado, completado, empezar, saltar, cerrar, reiniciar, setMinimizado]
  );

  return <TutorialContext.Provider value={valor}>{children}</TutorialContext.Provider>;
}

export function useTutorial(): TutorialValor {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial debe usarse dentro de TutorialProvider');
  return ctx;
}
