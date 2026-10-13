import React, { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BellRingIcon } from 'lucide-react';
import { useConversacion, type Autor } from '../../hooks/useConversacion';
import type { ClienteDetalle } from '../../types/cobranza';
import { estadoVentana } from '../../utils/cobranza';
import { etiquetaDia, primerNombre } from '../../utils/format';
import { EASE_OUT } from '../../utils/motion';
import { ChannelBadge } from '../ui/ChannelBadge';
import { Composer } from './Composer';
import { MessageBubble } from './MessageBubble';
import { VentanaIndicator } from './VentanaIndicator';

interface ConversacionProps {
  detalle: ClienteDetalle;
  actualizar: (fn: (d: ClienteDetalle) => ClienteDetalle) => void;
  recargar: () => Promise<void>;
}

export function Conversacion({ detalle, actualizar, recargar }: ConversacionProps) {
  const { cliente, mensajes } = detalle;
  const { enviar, ocupado } = useConversacion(cliente.id, actualizar, recargar);
  // Si el cliente espera respuesta, se escribe como equipo; si no, se puede simular su respuesta.
  const [autor, setAutor] = useState<Autor>(cliente.requiereAtencion ? 'equipo' : 'cliente');
  const listaRef = useRef<HTMLDivElement>(null);
  const reducir = useReducedMotion();
  const ventana = estadoVentana(mensajes);

  useEffect(() => {
    setAutor(cliente.requiereAtencion ? 'equipo' : 'cliente');
    // Solo al cambiar de cliente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente.id]);

  useEffect(() => {
    const el = listaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducir ? 'auto' : 'smooth' });
  }, [mensajes.length, reducir]);

  const alEnviar = async (texto: string) => {
    const ok = await enviar(texto, autor);
    // Tras simular la respuesta del cliente, el siguiente paso natural es contestarle.
    if (ok && autor === 'cliente') setAutor('equipo');
    return ok;
  };

  return (
    <section aria-label="Conversación" className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5 lg:px-5">
        <VentanaIndicator mensajes={mensajes} />
        <ChannelBadge canal={cliente.canal} />
      </div>

      <AnimatePresence initial={false}>
        {cliente.requiereAtencion &&
        <motion.div
          key="atencion"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="overflow-hidden border-b border-warn/25 bg-warn/[0.08]">

            <p role="status" className="flex items-start gap-2.5 px-4 py-2.5 text-[13px] lg:px-5">
              <BellRingIcon size={15} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
              <span>
                <span className="font-medium text-fg">{primerNombre(cliente.nombre)} espera tu respuesta.</span>{' '}
                <span className="text-muted">Sus recordatorios automáticos están en pausa hasta que le contestes.</span>
              </span>
            </p>
          </motion.div>
        }
      </AnimatePresence>

      <div ref={listaRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4 lg:px-5" aria-live="polite">
        {mensajes.length === 0 &&
        <p className="mx-auto max-w-xs py-10 text-center text-sm text-muted">
            Aún no hay mensajes. Usa “Enviar recordatorio” para mandarle la primera plantilla, o simula una respuesta del cliente para probar.
          </p>
        }
        {mensajes.map((m, i) => {
          const dia = etiquetaDia(m.fecha);
          const nuevoDia = i === 0 || etiquetaDia(mensajes[i - 1].fecha) !== dia;
          return (
            <Fragment key={m.id}>
              {nuevoDia &&
              <div className="flex justify-center py-2">
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted">{dia}</span>
                </div>
              }
              <MessageBubble mensaje={m} />
            </Fragment>);

        })}
      </div>

      <Composer
        autor={autor}
        onCambiarAutor={setAutor}
        onEnviar={alEnviar}
        ocupado={ocupado}
        ventanaAbierta={ventana.abierta}
        nombreCliente={primerNombre(cliente.nombre)} />

    </section>);

}
