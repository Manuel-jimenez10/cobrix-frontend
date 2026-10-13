import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCobranza } from '../contexts/CobranzaContext';
import * as api from '../services/api';
import type { ClienteDetalle, Mensaje } from '../types/cobranza';
import { abrirWhatsApp } from '../utils/cobranza';
import { avisarTutorial } from '../utils/tutorial';

/** Agrega un mensaje sin duplicarlo (Realtime puede haberlo traído antes). */
const conMensaje = (lista: Mensaje[], m: Mensaje) => lista.some((x) => x.id === m.id) ? lista : [...lista, m];

export type Autor = 'equipo' | 'cliente';

/**
 * Conversación con un cliente.
 *  · "equipo": la persona escribe su respuesta, se abre su WhatsApp con el texto listo y se registra aquí.
 *  · "cliente": la persona pega lo que el cliente le contestó por WhatsApp (también sirve para probar).
 */
export function useConversacion(
clienteId: string,
actualizar: (fn: (d: ClienteDetalle) => ClienteDetalle) => void,
recargarDetalle: () => Promise<void>)
{
  const { refrescarSilencioso, canal, telefonoPrueba } = useCobranza();
  const [ocupado, setOcupado] = useState(false);
  const ocupadoRef = useRef(false);

  const enviar = useCallback(
    async (texto: string, autor: Autor, telefonoCliente: string, origen: 'ia' | 'plantilla' | 'manual' = 'manual'): Promise<boolean> => {
      const limpio = texto.trim();
      if (!limpio || ocupadoRef.current) return false;
      // WhatsApp se abre en el mismo clic, antes de cualquier await (si no, el navegador lo bloquea).
      if (autor === 'equipo' && canal === 'whatsapp') abrirWhatsApp(telefonoPrueba || telefonoCliente, limpio);
      ocupadoRef.current = true;
      setOcupado(true);
      try {
        const mensaje = autor === 'cliente' ? await api.registrarRespuesta(clienteId, limpio) : await api.registrarEnvio(clienteId, { texto: limpio, tono: null, origen });
        actualizar((d) => ({
          ...d,
          mensajes: conMensaje(d.mensajes, mensaje),
          cliente: { ...d.cliente, requiereAtencion: autor === 'cliente', ultimoMensaje: mensaje }
        }));
        if (autor === 'equipo') {
          avisarTutorial('atender');
          toast.success('Respuesta registrada', { description: canal === 'whatsapp' ? 'Envíala en tu WhatsApp si aún no lo hiciste.' : undefined });
        } else {
          toast.success('Respuesta del cliente guardada', { description: 'Te sugerimos cómo contestarle.' });
        }
        void recargarDetalle();
        return true;
      } catch (e) {
        toast.error('No se pudo guardar el mensaje', { description: e instanceof Error ? e.message : 'Intenta de nuevo en un momento.' });
        return false;
      } finally {
        ocupadoRef.current = false;
        setOcupado(false);
        void refrescarSilencioso();
      }
    },
    [clienteId, actualizar, recargarDetalle, refrescarSilencioso, canal, telefonoPrueba]
  );

  return { enviar, ocupado };
}
