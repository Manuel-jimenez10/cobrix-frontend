import React from 'react';
import { motion } from 'framer-motion';
import { BellRingIcon, TriangleAlertIcon } from 'lucide-react';
import type { ClienteResumen } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { ChannelBadge } from '../ui/ChannelBadge';
import { Money } from '../ui/Money';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusBadge } from '../ui/StatusBadge';

interface ClienteRowProps {
  cliente: ClienteResumen;
  activo: boolean;
  onSeleccionar: () => void;
}

export function ClienteRow({ cliente: c, activo, onSeleccionar }: ClienteRowProps) {
  return (
    <motion.li layout="position" transition={{ duration: 0.22, ease: EASE_OUT }}>
      <button
        type="button"
        onClick={onSeleccionar}
        aria-current={activo ? 'true' : undefined}
        className={cn('relative block w-full px-4 py-3.5 text-left transition-colors duration-150', activo ? 'bg-surface-2' : 'hover:bg-surface-2/50')}>
        
        {activo && <motion.span layoutId="fila-activa" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand" transition={{ duration: 0.2, ease: EASE_OUT }} />}
        <div className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 truncate text-sm font-medium">{c.empresa}</span>
          <Money valor={c.deuda} className="text-[15px] font-semibold" />
        </div>
        <div className="mt-0.5 flex items-baseline justify-between gap-3 text-xs text-muted">
          <span className="min-w-0 truncate">{c.nombre}</span>
          <span className={cn('shrink-0 tabular-nums', c.diasAtraso > 60 ? 'text-bad' : c.diasAtraso > 0 ? 'text-warn' : '')}>
            {c.diasAtraso > 0 ? `${c.diasAtraso} días de atraso` : c.deuda > 0 ? 'Sin atraso' : 'Liquidado'}
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <StatusBadge estado={c.estado} />
          {c.deuda > 0 && <PriorityBadge nivel={c.prioridad.nivel} />}
          <ChannelBadge canal={c.canal} />
          {c.requiereAtencion &&
          <span className="inline-flex h-6 items-center gap-1 rounded-md bg-warn/10 px-2 text-xs font-medium text-warn">
              <BellRingIcon size={12} aria-hidden="true" />
              Espera respuesta
            </span>
          }
          {c.escalado &&
          <span className="inline-flex h-6 items-center gap-1 rounded-md bg-bad/10 px-2 text-xs font-medium text-bad">
              <TriangleAlertIcon size={12} aria-hidden="true" />
              En revisión
            </span>
          }
        </div>
      </button>
    </motion.li>);

}