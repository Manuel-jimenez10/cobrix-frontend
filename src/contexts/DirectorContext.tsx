import React, { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { conversacionesEjemplo } from '../data/directorConversaciones';
import * as api from '../services/api';
import { usaDatosMock } from '../utils/env';
import { avisarTutorial } from '../utils/tutorial';
import type { AgenteId } from '../types/cobranza';
import type { BloqueDirector, ConversacionDirector, MensajeDirector } from '../types/director';
import { crearId, escribir } from '../utils/stream';
import { useCobranza } from './CobranzaContext';

interface Delegacion {
  agente: AgenteId;
  texto: string;
}

interface DirectorValor {
  conversaciones: ConversacionDirector[];
  activa: ConversacionDirector;
  seleccionar: (id: string) => void;
  nueva: () => void;
  enviar: (texto: string) => Promise<void>;
  resolverConfirmacion: (mensajeId: string, bloqueId: string, confirmar: boolean) => Promise<void>;
  generando: boolean;
  delegando: Delegacion | null;
}

const DirectorContext = createContext<DirectorValor | null>(null);

const crearConversacion = (): ConversacionDirector => ({
  id: crearId('conv'),
  titulo: 'Nueva conversación',
  fecha: new Date().toISOString(),
  mensajes: []
});

function aplicarDelta(m: MensajeDirector, texto: string, nuevo: boolean): MensajeDirector {
  const ultimo = m.bloques[m.bloques.length - 1];
  if (!nuevo && ultimo?.tipo === 'texto') {
    return { ...m, bloques: [...m.bloques.slice(0, -1), { tipo: 'texto', texto: ultimo.texto + texto }] };
  }
  return { ...m, bloques: [...m.bloques, { tipo: 'texto', texto }] };
}

export function DirectorProvider({ children }: {children: ReactNode;}) {
  const { iniciar } = useCobranza();
  const [estado, setEstado] = useState(() => {
    // Las conversaciones de ejemplo usan IDs del mock: con backend real se empieza en blanco.
    const lista = [crearConversacion(), ...(usaDatosMock ? structuredClone(conversacionesEjemplo) : [])];
    return { lista, activaId: lista[0].id };
  });
  const [generando, setGenerando] = useState(false);
  const [delegando, setDelegando] = useState<Delegacion | null>(null);
  const estadoRef = useRef(estado);
  estadoRef.current = estado;
  const generandoRef = useRef(false);

  const actualizarConv = useCallback((id: string, fn: (c: ConversacionDirector) => ConversacionDirector) => {
    setEstado((s) => ({ ...s, lista: s.lista.map((c) => c.id === id ? fn(c) : c) }));
  }, []);

  const actualizarMensaje = useCallback(
    (convId: string, msgId: string, fn: (m: MensajeDirector) => MensajeDirector) => {
      actualizarConv(convId, (c) => ({ ...c, mensajes: c.mensajes.map((m) => m.id === msgId ? fn(m) : m) }));
    },
    [actualizarConv]
  );

  const responderLocal = useCallback(
    async (convId: string, texto: string) => {
      const msg: MensajeDirector = { id: crearId('dm'), rol: 'director', bloques: [], fecha: new Date().toISOString() };
      actualizarConv(convId, (c) => ({ ...c, mensajes: [...c.mensajes, msg] }));
      let primero = true;
      for await (const delta of escribir(texto)) {
        const nuevo = primero;
        actualizarMensaje(convId, msg.id, (m) => aplicarDelta(m, delta, nuevo));
        primero = false;
      }
    },
    [actualizarConv, actualizarMensaje]
  );

  const enviar = useCallback(
    async (texto: string) => {
      const limpio = texto.trim();
      if (!limpio || generandoRef.current) return;
      const { lista, activaId } = estadoRef.current;
      const conv = lista.find((c) => c.id === activaId);
      if (!conv) return;
      const ahora = new Date().toISOString();
      const msgUsuario: MensajeDirector = { id: crearId('dm'), rol: 'usuario', bloques: [{ tipo: 'texto', texto: limpio }], fecha: ahora };
      const msgDirector: MensajeDirector = { id: crearId('dm'), rol: 'director', bloques: [], fecha: ahora, delegaciones: [] };
      const historial = [...conv.mensajes, msgUsuario];
      actualizarConv(conv.id, (c) => ({
        ...c,
        titulo: c.mensajes.length === 0 ? limpio.length > 42 ? `${limpio.slice(0, 40)}…` : limpio : c.titulo,
        fecha: ahora,
        mensajes: [...c.mensajes, msgUsuario, msgDirector]
      }));
      generandoRef.current = true;
      setGenerando(true);
      try {
        for await (const ev of api.chatDirector(historial)) {
          if (ev.tipo === 'delegando') {
            setDelegando({ agente: ev.agente, texto: ev.texto });
            actualizarMensaje(conv.id, msgDirector.id, (m) => ({ ...m, delegaciones: [...(m.delegaciones ?? []), ev.agente] }));
          } else if (ev.tipo === 'delta') {
            setDelegando(null);
            actualizarMensaje(conv.id, msgDirector.id, (m) => aplicarDelta(m, ev.texto, ev.nuevo));
          } else if (ev.tipo === 'bloque') {
            setDelegando(null);
            actualizarMensaje(conv.id, msgDirector.id, (m) => ({ ...m, bloques: [...m.bloques, ev.bloque] }));
          }
        }
        avisarTutorial('director');
      } catch {
        actualizarMensaje(conv.id, msgDirector.id, (m) => aplicarDelta(m, 'Tuve un problema para responder. Intenta de nuevo en un momento.', true));
        toast.error('El Director no pudo responder');
      } finally {
        generandoRef.current = false;
        setGenerando(false);
        setDelegando(null);
      }
    },
    [actualizarConv, actualizarMensaje]
  );

  const resolverConfirmacion = useCallback(
    async (mensajeId: string, bloqueId: string, confirmar: boolean) => {
      if (generandoRef.current) return;
      const convId = estadoRef.current.activaId;
      const conv = estadoRef.current.lista.find((c) => c.id === convId);
      const bloque = conv?.mensajes.
      find((m) => m.id === mensajeId)?.
      bloques.find((b): b is Extract<BloqueDirector, {tipo: 'confirmacion';}> => b.tipo === 'confirmacion' && b.id === bloqueId);
      if (!bloque || bloque.estado !== 'pendiente') return;

      actualizarMensaje(convId, mensajeId, (m) => ({
        ...m,
        bloques: m.bloques.map((b) => b.tipo === 'confirmacion' && b.id === bloqueId ? { ...b, estado: confirmar ? 'confirmada' : 'cancelada' } : b)
      }));

      generandoRef.current = true;
      setGenerando(true);
      try {
        if (!confirmar) {
          await responderLocal(convId, 'Entendido, no envié ningún mensaje. Aquí estoy si cambias de opinión.');
          return;
        }
        setDelegando({ agente: 'redactor', texto: 'El Redactor está escribiendo los mensajes…' });
        const r = await iniciar(bloque.clienteIds, { tono: bloque.tono });
        setDelegando(null);
        toast.success(`${r.enviados} mensajes enviados`, { description: `Tono ${bloque.tono} · el Negociador atenderá las respuestas` });
        await responderLocal(convId, `Listo. El Redactor envió ${r.enviados} mensajes con tono ${bloque.tono}. Te aviso en cuanto alguien responda.`);
      } catch {
        toast.error('No se pudieron enviar los mensajes');
        await responderLocal(convId, 'No pude completar el envío. Revisa la conexión con WhatsApp en Ajustes e inténtalo de nuevo.');
      } finally {
        generandoRef.current = false;
        setGenerando(false);
        setDelegando(null);
      }
    },
    [actualizarMensaje, iniciar, responderLocal]
  );

  const seleccionar = useCallback((id: string) => setEstado((s) => ({ ...s, activaId: id })), []);

  const nueva = useCallback(() => {
    setEstado((s) => {
      const actual = s.lista.find((c) => c.id === s.activaId);
      const vacia = s.lista.find((c) => c.mensajes.length === 0);
      if (actual && actual.mensajes.length === 0) return s;
      if (vacia) return { ...s, activaId: vacia.id };
      const conv = crearConversacion();
      return { lista: [conv, ...s.lista], activaId: conv.id };
    });
  }, []);

  const activa = estado.lista.find((c) => c.id === estado.activaId) ?? estado.lista[0];

  const valor = useMemo<DirectorValor>(
    () => ({ conversaciones: estado.lista, activa, seleccionar, nueva, enviar, resolverConfirmacion, generando, delegando }),
    [estado.lista, activa, seleccionar, nueva, enviar, resolverConfirmacion, generando, delegando]
  );

  return <DirectorContext.Provider value={valor}>{children}</DirectorContext.Provider>;
}

export function useDirector(): DirectorValor {
  const ctx = useContext(DirectorContext);
  if (!ctx) throw new Error('useDirector debe usarse dentro de DirectorProvider');
  return ctx;
}