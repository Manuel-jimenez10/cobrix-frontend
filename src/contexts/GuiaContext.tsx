import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as api from '../services/api';
import type { AccionGuia } from '../types/guia';
import { avisarTutorial } from '../utils/tutorial';

export interface MensajeChatGuia {
  id: string;
  rol: 'usuario' | 'guia';
  texto: string;
  acciones: AccionGuia[];
  error?: boolean;
}

interface GuiaValor {
  mensajes: MensajeChatGuia[];
  generando: boolean;
  enviar: (texto: string) => Promise<void>;
  reiniciar: () => void;
  /** Panel flotante (escritorio). En móvil la Guía es una pantalla: /guia */
  abierto: boolean;
  setAbierto: (v: boolean | ((x: boolean) => boolean)) => void;
}

const GuiaContext = createContext<GuiaValor | null>(null);
let contador = 0;
const nuevoId = () => `g${Date.now().toString(36)}${++contador}`;

export function GuiaProvider({ children }: {children: ReactNode;}) {
  const [mensajes, setMensajes] = useState<MensajeChatGuia[]>([]);
  const [generando, setGenerando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  const pantallaRef = useRef(pathname);
  pantallaRef.current = pathname;
  const mensajesRef = useRef(mensajes);
  mensajesRef.current = mensajes;
  const ocupado = useRef(false);

  const enviar = useCallback(async (texto: string) => {
    const limpio = texto.trim();
    if (!limpio || ocupado.current) return;
    ocupado.current = true;
    setGenerando(true);
    const pregunta: MensajeChatGuia = { id: nuevoId(), rol: 'usuario', texto: limpio, acciones: [] };
    const respuesta: MensajeChatGuia = { id: nuevoId(), rol: 'guia', texto: '', acciones: [] };
    const historial = [...mensajesRef.current.filter((m) => !m.error), pregunta];
    setMensajes((ms) => [...ms, pregunta, respuesta]);
    const editar = (fn: (m: MensajeChatGuia) => MensajeChatGuia) => setMensajes((ms) => ms.map((m) => m.id === respuesta.id ? fn(m) : m));
    try {
      for await (const ev of api.chatGuia(historial.map((m) => ({ rol: m.rol, texto: m.texto })), pantallaRef.current)) {
        if (ev.tipo === 'delta') editar((m) => ({ ...m, texto: m.texto + ev.texto }));else
        if (ev.tipo === 'accion') editar((m) => ({ ...m, acciones: [...m.acciones, ev.accion] }));
      }
      avisarTutorial('guia');
    } catch {
      editar((m) => ({ ...m, texto: m.texto || 'No pude responder en este momento. Intenta de nuevo en unos segundos.', error: true }));
    } finally {
      ocupado.current = false;
      setGenerando(false);
    }
  }, []);

  const reiniciar = useCallback(() => {
    if (!ocupado.current) setMensajes([]);
  }, []);

  const valor = useMemo<GuiaValor>(() => ({ mensajes, generando, enviar, reiniciar, abierto, setAbierto }), [mensajes, generando, enviar, reiniciar, abierto]);
  return <GuiaContext.Provider value={valor}>{children}</GuiaContext.Provider>;
}

export function useGuia(): GuiaValor {
  const ctx = useContext(GuiaContext);
  if (!ctx) throw new Error('useGuia debe usarse dentro de GuiaProvider');
  return ctx;
}
