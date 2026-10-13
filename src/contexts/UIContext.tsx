import React, {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState } from
'react';
import type { FiltrosClientes } from '../types/cobranza';

type Tema = 'oscuro' | 'claro';

interface EstadoCobranzaUI {
  abierta: boolean;
  clienteIds: string[] | null;
}

interface UIValor {
  tema: Tema;
  alternarTema: () => void;
  sidebarColapsado: boolean;
  alternarSidebar: () => void;
  directorAbierto: boolean;
  setDirectorAbierto: Dispatch<SetStateAction<boolean>>;
  paletaAbierta: boolean;
  setPaletaAbierta: Dispatch<SetStateAction<boolean>>;
  cobranza: EstadoCobranzaUI;
  abrirCobranza: (clienteIds?: string[]) => void;
  cerrarCobranza: () => void;
  filtrosCartera: FiltrosClientes;
  setFiltrosCartera: Dispatch<SetStateAction<FiltrosClientes>>;
}

const UIContext = createContext<UIValor | null>(null);

export function UIProvider({ children, temaInicial }: {children: ReactNode;temaInicial: Tema;}) {
  const [tema, setTema] = useState<Tema>(temaInicial);
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  const [directorAbierto, setDirectorAbierto] = useState(false);
  const [paletaAbierta, setPaletaAbierta] = useState(false);
  const [cobranza, setCobranza] = useState<EstadoCobranzaUI>({ abierta: false, clienteIds: null });
  const [filtrosCartera, setFiltrosCartera] = useState<FiltrosClientes>({
    busqueda: '',
    estado: 'todos',
    prioridad: 'todas',
    orden: 'prioridad'
  });

  useEffect(() => setTema(temaInicial), [temaInicial]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', tema === 'claro');
  }, [tema]);

  const alternarTema = useCallback(() => setTema((t) => t === 'oscuro' ? 'claro' : 'oscuro'), []);
  const alternarSidebar = useCallback(() => setSidebarColapsado((v) => !v), []);
  const abrirCobranza = useCallback((clienteIds?: string[]) => {
    setPaletaAbierta(false);
    setCobranza({ abierta: true, clienteIds: clienteIds ?? null });
  }, []);
  const cerrarCobranza = useCallback(() => setCobranza((c) => ({ ...c, abierta: false })), []);

  const valor = useMemo<UIValor>(
    () => ({
      tema,
      alternarTema,
      sidebarColapsado,
      alternarSidebar,
      directorAbierto,
      setDirectorAbierto,
      paletaAbierta,
      setPaletaAbierta,
      cobranza,
      abrirCobranza,
      cerrarCobranza,
      filtrosCartera,
      setFiltrosCartera
    }),
    [tema, alternarTema, sidebarColapsado, alternarSidebar, directorAbierto, paletaAbierta, cobranza, abrirCobranza, cerrarCobranza, filtrosCartera]
  );

  return <UIContext.Provider value={valor}>{children}</UIContext.Provider>;
}

export function useUI(): UIValor {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI debe usarse dentro de UIProvider');
  return ctx;
}