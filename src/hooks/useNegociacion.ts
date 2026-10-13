import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCobranza } from '../contexts/CobranzaContext';
import * as api from '../services/api';
import type { ClienteDetalle, Escalamiento, Mensaje, PromesaPago } from '../types/cobranza';
import { formatFecha, formatMXN } from '../utils/format';
import { avisarTutorial } from '../utils/tutorial';

export type AvisoConversacion =
{tipo: 'promesa';despuesDe: string;promesa: PromesaPago;} |
{tipo: 'escalamiento';despuesDe: string;escalamiento: Escalamiento;};

/** Agrega un mensaje sin duplicarlo (Realtime puede haberlo traído antes). */
const conMensaje = (lista: Mensaje[], m: Mensaje) => lista.some((x) => x.id === m.id) ? lista : [...lista, m];

export function useNegociacion(
clienteId: string,
actualizar: (fn: (d: ClienteDetalle) => ClienteDetalle) => void,
recargarDetalle: () => Promise<void>)
{
  const { refrescarSilencioso } = useCobranza();
  const [ocupado, setOcupado] = useState(false);
  const [pensando, setPensando] = useState(false);
  const [textoStream, setTextoStream] = useState<string | null>(null);
  const [avisos, setAvisos] = useState<AvisoConversacion[]>([]);
  const ocupadoRef = useRef(false);

  useEffect(() => {
    setAvisos([]);
    setTextoStream(null);
    setPensando(false);
  }, [clienteId]);

  const enviar = useCallback(
    async (texto: string) => {
      const limpio = texto.trim();
      if (!limpio || ocupadoRef.current) return;
      ocupadoRef.current = true;
      setOcupado(true);
      const pendientes: Array<{tipo: 'promesa';promesa: PromesaPago;} | {tipo: 'escalamiento';escalamiento: Escalamiento;}> = [];
      try {
        for await (const ev of api.responderComoCliente(clienteId, limpio)) {
          switch (ev.tipo) {
            case 'cliente':
              actualizar((d) => ({ ...d, mensajes: conMensaje(d.mensajes, ev.mensaje) }));
              break;
            case 'pensando':
              setPensando(true);
              break;
            case 'delta':
              setPensando(false);
              setTextoStream((t) => (t ?? '') + ev.texto);
              break;
            case 'promesa':
              pendientes.push({ tipo: 'promesa', promesa: ev.promesa });
              actualizar((d) => ({ ...d, promesas: d.promesas.some((p) => p.id === ev.promesa.id) ? d.promesas : [ev.promesa, ...d.promesas] }));
              toast.success('Promesa de pago registrada', {
                description: `${formatMXN(ev.promesa.monto)} · ${formatFecha(ev.promesa.fechaCompromiso)}`
              });
              break;
            case 'escalamiento':
              pendientes.push({ tipo: 'escalamiento', escalamiento: ev.escalamiento });
              actualizar((d) => ({
                ...d,
                escalamientos: [...d.escalamientos, ev.escalamiento],
                cliente: { ...d.cliente, escalado: true }
              }));
              toast.warning('Escalado a humano', { description: ev.escalamiento.motivo });
              break;
            case 'fin':
              setTextoStream(null);
              actualizar((d) => ({ ...d, mensajes: conMensaje(d.mensajes, ev.mensaje) }));
              setAvisos((a) => [
              ...a,
              ...pendientes.map((p) => ({ ...p, despuesDe: ev.mensaje.id }) as AvisoConversacion)]
              );
              break;
          }
        }
        avisarTutorial('negociar');
        await recargarDetalle();
      } catch {
        toast.error('No se pudo enviar el mensaje', { description: 'Intenta de nuevo en un momento.' });
      } finally {
        ocupadoRef.current = false;
        setOcupado(false);
        setPensando(false);
        setTextoStream(null);
        void refrescarSilencioso();
      }
    },
    [clienteId, actualizar, recargarDetalle, refrescarSilencioso]
  );

  return { enviar, ocupado, pensando, textoStream, avisos };
}