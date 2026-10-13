import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, CircleIcon, LoaderCircleIcon, SendIcon } from 'lucide-react';
import type { Canal, ProgresoCobranza } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { AgentAvatar } from '../ui/AgentAvatar';
import { ToneBadge } from '../ui/ToneBadge';

type EstadoPaso = 'pendiente' | 'activo' | 'hecho';

function IconoEstado({ estado }: {estado: EstadoPaso;}) {
  if (estado === 'hecho') return <CheckIcon size={16} className="text-ok" aria-label="Completado" />;
  if (estado === 'activo') return <LoaderCircleIcon size={16} className="text-muted motion-safe:animate-spin" aria-label="En curso" />;
  return <CircleIcon size={14} className="text-line" aria-label="Pendiente" />;
}

export function CobranzaProgreso({ progreso, canal }: {progreso: ProgresoCobranza | null;canal: Canal;}) {
  const fase = progreso?.fase ?? 'analizando';
  const total = progreso?.orden.length ?? 0;
  const enviados = progreso?.enviados.length ?? 0;
  const actual = progreso?.orden.find((o) => o.clienteId === progreso.actualId);

  const pasoAnalista: EstadoPaso = fase === 'analizando' ? 'activo' : 'hecho';
  const pasoRedactor: EstadoPaso = fase === 'analizando' ? 'pendiente' : fase === 'listo' ? 'hecho' : 'activo';
  const pasoEnvio: EstadoPaso = fase === 'listo' ? 'hecho' : enviados > 0 ? 'activo' : 'pendiente';

  const pasos = [
  {
    clave: 'analista',
    avatar: <AgentAvatar agente="analista" activo={pasoAnalista === 'activo'} />,
    titulo: 'Analista prioriza',
    detalle: pasoAnalista === 'activo' ? 'Evaluando saldos, atrasos e historial…' : `Ordenó ${total} clientes por prioridad`,
    estado: pasoAnalista
  },
  {
    clave: 'redactor',
    avatar: <AgentAvatar agente="redactor" activo={pasoRedactor === 'activo'} />,
    titulo: 'Redactor escribe',
    detalle: pasoRedactor === 'pendiente' ? 'Esperando la cola del Analista' : pasoRedactor === 'hecho' ? 'Mensajes listos con el tono de cada intento' : actual ? `Escribiendo para ${actual.empresa}…` : 'Preparando el siguiente mensaje…',
    estado: pasoRedactor
  },
  {
    clave: 'envio',
    avatar:
    <span className={cn('grid h-8 w-8 place-items-center rounded-full ring-1', pasoEnvio === 'pendiente' ? 'bg-surface-2 text-muted ring-line' : 'bg-brand/15 text-brand ring-brand/40')} aria-hidden="true">
          <SendIcon size={14} />
        </span>,

    titulo: canal === 'whatsapp' ? 'Envío por WhatsApp' : 'Envío al simulador',
    detalle: `${enviados} de ${total || '—'} mensajes enviados`,
    estado: pasoEnvio
  }];


  return (
    <div className="space-y-5">
      <ol className="space-y-1" aria-label="Progreso de la cobranza">
        {pasos.map((p) =>
        <li key={p.clave} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200', p.estado === 'activo' && 'bg-surface-2')}>
            {p.avatar}
            <div className="min-w-0 flex-1">
              <p className={cn('text-sm font-medium', p.estado === 'pendiente' && 'text-muted')}>{p.titulo}</p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={p.detalle} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="truncate text-xs text-muted">
                  {p.detalle}
                </motion.p>
              </AnimatePresence>
            </div>
            <IconoEstado estado={p.estado} />
          </li>
        )}
      </ol>

      {progreso && fase !== 'analizando' && total > 0 &&
      <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>Cola de cobranza</span>
            <span className="tabular-nums">
              {enviados}/{total}
            </span>
          </div>
          <div className="mb-3 h-1 overflow-hidden rounded-full bg-line">
            <motion.div className="h-full rounded-full bg-brand" initial={false} animate={{ width: `${enviados / total * 100}%` }} transition={{ duration: 0.25, ease: EASE_OUT }} />
          </div>
          <ol className="divide-y divide-line rounded-xl border border-line">
            {progreso.orden.map((item, i) => {
            const enviado = progreso.enviados.includes(item.clienteId);
            const esActual = progreso.actualId === item.clienteId && !enviado;
            return (
              <motion.li
                key={item.clienteId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.04, 0.3), ease: EASE_OUT }}
                className="flex items-center gap-3 px-3 py-2.5">
                
                  <span className="w-5 text-xs tabular-nums text-muted">{i + 1}</span>
                  <span className={cn('min-w-0 flex-1 truncate text-sm', !enviado && !esActual && 'text-muted')}>{item.empresa}</span>
                  <ToneBadge tono={item.tono} />
                  <span className="w-4">
                    {enviado ?
                  <motion.span initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.16 }} className="block">
                        <CheckIcon size={16} className="text-ok" aria-label="Enviado" />
                      </motion.span> :
                  esActual ?
                  <LoaderCircleIcon size={16} className="text-redactor motion-safe:animate-spin" aria-label="Redactando" /> :

                  <CircleIcon size={10} className="ml-0.5 text-line" aria-label="En cola" />
                  }
                  </span>
                </motion.li>);

          })}
          </ol>
        </div>
      }
    </div>);

}