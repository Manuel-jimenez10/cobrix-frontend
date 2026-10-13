import React, { useRef } from 'react';
import { motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { CheckIcon, SendIcon, TriangleAlertIcon } from 'lucide-react';
import type { ClienteResumen } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { ChannelBadge } from '../ui/ChannelBadge';
import { Money } from '../ui/Money';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusBadge } from '../ui/StatusBadge';

const UMBRAL = 96;

interface ClienteSwipeCardProps {
  cliente: ClienteResumen;
  onAbrir: () => void;
  onCobrar: () => void;
  onPagada: () => void;
}

/** Tarjeta móvil: deslizar a la derecha = enviar recordatorio; a la izquierda = marcar pagada. */
export function ClienteSwipeCard({ cliente: c, onAbrir, onCobrar, onPagada }: ClienteSwipeCardProps) {
  const x = useMotionValue(0);
  const opacidadCobrar = useTransform(x, [8, UMBRAL], [0, 1]);
  const opacidadPagada = useTransform(x, [-UMBRAL, -8], [1, 0]);
  const arrastrando = useRef(false);
  const puedeCobrar = c.deuda > 0 && !c.escalado && !c.requiereAtencion;
  const puedePagar = c.deuda > 0;

  const alSoltar = (_: unknown, __: PanInfo) => {
    const desplazamiento = x.get();
    if (desplazamiento > UMBRAL && puedeCobrar) {
      navigator.vibrate?.(8);
      onCobrar();
    } else if (desplazamiento < -UMBRAL && puedePagar) {
      navigator.vibrate?.(8);
      onPagada();
    }
    setTimeout(() => {
      arrastrando.current = false;
    }, 0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0" aria-hidden="true">
        <motion.div style={{ opacity: opacidadCobrar }} className="absolute inset-0 flex items-center gap-2 bg-brand pl-5 text-sm font-semibold text-on-brand">
          <SendIcon size={18} />
          Enviar recordatorio
        </motion.div>
        <motion.div style={{ opacity: opacidadPagada }} className="absolute inset-0 flex items-center justify-end gap-2 bg-surface-2 pr-5 text-sm font-semibold text-ok">
          Marcar pagada
          <CheckIcon size={18} />
        </motion.div>
      </div>
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: puedePagar ? -150 : 0, right: puedeCobrar ? 150 : 0 }}
        dragElastic={0.1}
        dragSnapToOrigin
        dragDirectionLock
        onDragStart={() => {
          arrastrando.current = true;
        }}
        onDragEnd={alSoltar}
        className="relative rounded-2xl border border-line bg-surface">
        
        <button
          type="button"
          onClick={() => {
            if (!arrastrando.current) onAbrir();
          }}
          className="block w-full p-4 text-left active:bg-surface-2/60">
          
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-[15px] font-medium">{c.empresa}</span>
            <Money valor={c.deuda} className="text-[17px] font-semibold" />
          </div>
          <div className="mt-0.5 flex items-baseline justify-between gap-3 text-[13px] text-muted">
            <span className="min-w-0 truncate">{c.nombre}</span>
            <span className={cn('shrink-0 tabular-nums', c.diasAtraso > 60 ? 'text-bad' : c.diasAtraso > 0 ? 'text-warn' : '')}>
              {c.diasAtraso > 0 ? `${c.diasAtraso} días` : c.deuda > 0 ? 'Sin atraso' : 'Liquidado'}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <StatusBadge estado={c.estado} />
            {c.deuda > 0 && <PriorityBadge nivel={c.prioridad.nivel} />}
            <ChannelBadge canal={c.canal} />
            {c.escalado &&
            <span className="inline-flex h-6 items-center gap-1 rounded-md bg-bad/10 px-2 text-xs font-medium text-bad">
                <TriangleAlertIcon size={12} aria-hidden="true" />
                Escalado
              </span>
            }
          </div>
        </button>
      </motion.div>
    </div>);

}