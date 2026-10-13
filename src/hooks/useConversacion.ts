import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCobranza } from '../contexts/CobranzaContext';
import * as api from '../services/api';
import type { ClienteDetalle, Mensaje } from '../types/cobranza';
import { avisarTutorial } from '../utils/tutorial';

/** Agrega un mensaje sin duplicarlo (Realtime puede haberlo traído antes). */
const conMensaje = (lista: Mensaje[], m: Mensaje) => lista.some((x) => x.id === m.id) ? lista : [...lista, m];

export type Autor = 'equipo' | 'cliente';

/**
 * Conversación con un cliente. La escribe una persona del equipo;
 * el modo "cliente" es el simulador para probar la app sin WhatsApp.
 */
export function useConversacion(
clienteId: string,
actualizar: (fn: (d: ClienteDetalle) => ClienteDetalle) => void,
recargarDetalle: () => Promise<void>)
{
  const { refrescarSilencioso } = useCobranza();
  const [ocupado, setOcupado] = useState(false);
  const ocupadoRef = useRef(false);

  const enviar = useCallback(
    async (texto: string, autor: Autor): Promise<boolean> => {
      const limpio = texto.trim();
      if (!limpio || ocupadoRef.current) return false;
      ocupadoRef.current = true;
      setOcupado(true);
      try {
        const mensaje = autor === 'cliente' ? await api.responderComoCliente(clienteId, limpio) : await api.responderComoEquipo(clienteId, limpio);
        actualizar((d) => ({
          ...d,
          mensajes: conMensaje(d.mensajes, mensaje),
          cliente: { ...d.cliente, requiereAtencion: autor === 'cliente', ultimoMensaje: mensaje }
        }));
        if (autor === 'equipo') {
          avisarTutorial('atender');
          toast.success('Respuesta enviada');
        }
        void recargarDetalle();
        return true;
      } catch (e) {
        toast.error('No se pudo enviar el mensaje', { description: e instanceof Error ? e.message : 'Intenta de nuevo en un momento.' });
        return false;
      } finally {
        ocupadoRef.current = false;
        setOcupado(false);
        void refrescarSilencioso();
      }
    },
    [clienteId, actualizar, recargarDetalle, refrescarSilencioso]
  );

  return { enviar, ocupado };
}
