import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';
import type { Mensaje } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { formatHora } from '../../utils/format';
import { EASE_OUT } from '../../utils/motion';
import { ToneBadge } from '../ui/ToneBadge';

interface MessageBubbleProps {
  mensaje: Pick<Mensaje, 'rol' | 'agente' | 'contenido' | 'tono' | 'esPlantilla' | 'fecha'>;
  streaming?: boolean;
}

export function MessageBubble({ mensaje: m, streaming = false }: MessageBubbleProps) {
  const esAgente = m.rol === 'agente';
  // agente null (o el antiguo 'negociador') = lo escribió una persona del equipo.
  const deEquipo = esAgente && (m.agente === null || m.agente === 'negociador');
  const etiqueta = !esAgente ? null : deEquipo ? 'Tu equipo' : m.esPlantilla || m.agente === 'redactor' ? 'Recordatorio' : 'Cobrix';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className={cn('flex', esAgente ? 'justify-end' : 'justify-start')}>
      
      <div
        className={cn(
          'max-w-[86%] rounded-2xl px-3.5 py-2.5 lg:max-w-[72%]',
          esAgente ? 'rounded-br-md border border-brand/20 bg-brand/[0.11]' : 'rounded-bl-md border border-line bg-surface-2'
        )}>
        
        {etiqueta &&
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className={cn('text-xs font-semibold', deEquipo ? 'text-fg' : 'text-muted')}>{etiqueta}</span>
            {m.tono && <ToneBadge tono={m.tono} />}
            {m.esPlantilla && <span className="inline-flex h-5 items-center rounded border border-line px-1.5 text-[11px] font-medium text-muted">Plantilla</span>}
          </div>
        }
        <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed">
          {m.contenido}
          {streaming && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-fg motion-safe:animate-pulse" aria-hidden="true" />}
        </p>
        {!streaming &&
        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] tabular-nums text-muted">
            {formatHora(m.fecha)}
            {esAgente && <CheckIcon size={13} className="text-muted" aria-label="Enviado" />}
          </div>
        }
      </div>
    </motion.div>);

}