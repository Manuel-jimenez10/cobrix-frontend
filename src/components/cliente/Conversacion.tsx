import React, { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BellRingIcon, CalendarCheckIcon, SmartphoneIcon, XIcon } from 'lucide-react';
import { useCobranza } from '../../contexts/CobranzaContext';
import { useConversacion, type Autor } from '../../hooks/useConversacion';
import { useSugerencias } from '../../hooks/useSugerencias';
import type { ClienteDetalle, OrigenTexto } from '../../types/cobranza';
import { etiquetaDia, formatFecha, formatMXN, primerNombre } from '../../utils/format';
import { EASE_OUT } from '../../utils/motion';
import { Button } from '../ui/Button';
import { ChannelBadge } from '../ui/ChannelBadge';
import { Composer } from './Composer';
import { MessageBubble } from './MessageBubble';

interface ConversacionProps {
  detalle: ClienteDetalle;
  actualizar: (fn: (d: ClienteDetalle) => ClienteDetalle) => void;
  recargar: () => Promise<void>;
  /** Abre "Registrar promesa" con el monto y la fecha que detectó el asistente. */
  onRegistrarPromesa: (inicial: {monto: number;fecha: string;}) => void;
}

export function Conversacion({ detalle, actualizar, recargar, onRegistrarPromesa }: ConversacionProps) {
  const { cliente, mensajes } = detalle;
  const { canal, telefonoPrueba } = useCobranza();
  const { enviar, ocupado } = useConversacion(cliente.id, actualizar, recargar);
  // El asistente sugiere respuestas solo cuando el último mensaje es del cliente.
  const ultimo = mensajes[mensajes.length - 1];
  const { datos: sugerencias, cargando: cargandoSugerencias, descartarPromesa } = useSugerencias(cliente.id, ultimo?.rol === 'cliente' ? ultimo.id : null);
  const promesa = cliente.deuda > 0 && cliente.estado !== 'promesa' ? sugerencias?.promesa : null;
  // Si el cliente espera respuesta, se escribe como equipo; si no, se puede simular su respuesta.
  const [autor, setAutor] = useState<Autor>(cliente.requiereAtencion ? 'equipo' : 'cliente');
  const listaRef = useRef<HTMLDivElement>(null);
  const reducir = useReducedMotion();

  useEffect(() => {
    setAutor(cliente.requiereAtencion ? 'equipo' : 'cliente');
    // Solo al cambiar de cliente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente.id]);

  useEffect(() => {
    const el = listaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducir ? 'auto' : 'smooth' });
  }, [mensajes.length, reducir]);

  const alEnviar = async (texto: string, origen: OrigenTexto | 'manual') => {
    const ok = await enviar(texto, autor, cliente.telefono, origen);
    // Tras simular la respuesta del cliente, el siguiente paso natural es contestarle.
    if (ok && autor === 'cliente') setAutor('equipo');
    return ok;
  };

  return (
    <section aria-label="Conversación" className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5 lg:px-5">
        <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted">
          <SmartphoneIcon size={13} className="shrink-0 text-brand" aria-hidden="true" />
          {canal === 'whatsapp' ? `Se envía desde tu WhatsApp${telefonoPrueba ? ' · modo pruebas' : ''}` : 'Modo simulador: nada sale de Cobrix'}
        </p>
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
                <span className="text-muted">Sus recordatorios están en pausa hasta que le contestes.</span>
              </span>
            </p>
          </motion.div>
        }
      </AnimatePresence>

      <div ref={listaRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4 lg:px-5" aria-live="polite">
        {mensajes.length === 0 &&
        <p className="mx-auto max-w-xs py-10 text-center text-sm text-muted">
            Aún no hay mensajes. Usa “Enviar recordatorio” para mandarle el primero desde tu WhatsApp. Cuando te conteste, pega su respuesta aquí abajo.
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

      <AnimatePresence initial={false}>
        {promesa &&
        <motion.div
          key="promesa"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="overflow-hidden border-t border-promise/25 bg-promise/[0.07]">

            <div className="flex items-center gap-3 px-4 py-2.5 lg:px-5" data-tour="promesa-detectada">
              <CalendarCheckIcon size={16} className="shrink-0 text-promise" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-[13px]">
                <span className="font-medium text-fg">
                  {primerNombre(cliente.nombre)} prometió pagar {formatMXN(promesa.monto)} el {formatFecha(`${promesa.fecha}T12:00:00`)}.
                </span>{' '}
                <span className="text-muted">{sugerencias?.origen === 'ia' ? 'Lo detectó la IA.' : 'Detectado en su mensaje.'}</span>
              </p>
              <Button variante="secundario" tamano="sm" onClick={() => onRegistrarPromesa({ monto: promesa.monto, fecha: promesa.fecha })}>
                Registrar
              </Button>
              <button type="button" onClick={descartarPromesa} aria-label="Descartar" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:text-fg">
                <XIcon size={15} />
              </button>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <Composer
        autor={autor}
        onCambiarAutor={setAutor}
        onEnviar={alEnviar}
        ocupado={ocupado}
        canal={canal}
        nombreCliente={primerNombre(cliente.nombre)}
        sugerencias={sugerencias ? { lista: sugerencias.sugerencias, origen: sugerencias.origen } : null}
        cargandoSugerencias={cargandoSugerencias} />

    </section>);

}
