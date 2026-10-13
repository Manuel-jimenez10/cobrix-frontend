import React, { Fragment, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { TriangleAlertIcon } from 'lucide-react';
import { useNegociacion } from '../../hooks/useNegociacion';
import type { ClienteDetalle } from '../../types/cobranza';
import { etiquetaDia, formatFecha } from '../../utils/format';
import { EASE_OUT } from '../../utils/motion';
import { AgentAvatar } from '../ui/AgentAvatar';
import { ChannelBadge } from '../ui/ChannelBadge';
import { Money } from '../ui/Money';
import { SuccessCheck } from '../ui/SuccessCheck';
import { MessageBubble } from './MessageBubble';
import { SimuladorComposer } from './SimuladorComposer';
import { VentanaIndicator } from './VentanaIndicator';

interface ConversacionProps {
  detalle: ClienteDetalle;
  actualizar: (fn: (d: ClienteDetalle) => ClienteDetalle) => void;
  recargar: () => Promise<void>;
}

export function Conversacion({ detalle, actualizar, recargar }: ConversacionProps) {
  const { cliente, mensajes } = detalle;
  const { enviar, ocupado, pensando, textoStream, avisos } = useNegociacion(cliente.id, actualizar, recargar);
  const listaRef = useRef<HTMLDivElement>(null);
  const reducir = useReducedMotion();

  useEffect(() => {
    const el = listaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducir ? 'auto' : 'smooth' });
  }, [mensajes.length, textoStream, pensando, avisos.length, reducir]);

  return (
    <section aria-label="Conversación" className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5 lg:px-5">
        <VentanaIndicator mensajes={mensajes} />
        <ChannelBadge canal={cliente.canal} />
      </div>

      <div ref={listaRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4 lg:px-5" aria-live="polite">
        {mensajes.length === 0 && !ocupado &&
        <p className="mx-auto max-w-xs py-10 text-center text-sm text-muted">
            Aún no hay mensajes. Usa “Cobrar con IA” para que el Redactor envíe el primero, o responde como cliente para probar al Negociador.
          </p>
        }
        {mensajes.map((m, i) => {
          const dia = etiquetaDia(m.fecha);
          const nuevoDia = i === 0 || etiquetaDia(mensajes[i - 1].fecha) !== dia;
          const avisosAqui = avisos.filter((a) => a.despuesDe === m.id);
          return (
            <Fragment key={m.id}>
              {nuevoDia &&
              <div className="flex justify-center py-2">
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted">{dia}</span>
                </div>
              }
              <MessageBubble mensaje={m} />
              {avisosAqui.map((a) =>
              a.tipo === 'promesa' ?
              <motion.div
                key={a.promesa.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
                className="mx-auto my-3 flex max-w-sm items-center gap-3 rounded-2xl border border-promise/30 bg-promise/[0.08] p-3.5">
                
                    <SuccessCheck tamano={36} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Promesa de pago creada</p>
                      <p className="text-xs text-muted">
                        <Money valor={a.promesa.monto} className="text-fg" /> · {formatFecha(a.promesa.fechaCompromiso)}
                      </p>
                    </div>
                  </motion.div> :

              <motion.div
                key={a.escalamiento.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
                role="alert"
                className="mx-auto my-3 flex max-w-sm items-start gap-3 rounded-2xl border border-bad/30 bg-bad/[0.08] p-3.5">
                
                    <TriangleAlertIcon size={18} className="mt-0.5 shrink-0 text-bad" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-bad">Escalado a humano</p>
                      <p className="mt-0.5 text-xs text-muted">{a.escalamiento.motivo} Los recordatorios automáticos quedan en pausa.</p>
                    </div>
                  </motion.div>

              )}
            </Fragment>);

        })}

        <AnimatePresence>
          {pensando &&
          <motion.div key="pensando" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }} className="flex items-center justify-end gap-2 pt-1">
              <span className="text-xs font-medium text-negociador">El Negociador está escribiendo</span>
              <span className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((i) =>
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-negociador"
                animate={reducir ? undefined : { opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />

              )}
              </span>
              <AgentAvatar agente="negociador" tamano="sm" activo />
            </motion.div>
          }
        </AnimatePresence>
        {textoStream !== null &&
        <MessageBubble
          streaming
          mensaje={{ rol: 'agente', agente: 'negociador', contenido: textoStream, tono: null, esPlantilla: false, fecha: new Date().toISOString() }} />

        }
      </div>

      <SimuladorComposer onEnviar={enviar} ocupado={ocupado} />
    </section>);

}