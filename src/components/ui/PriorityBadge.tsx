import React from 'react';
import type { NivelPrioridad } from '../../types/cobranza';
import { cn } from '../../utils/cn';

const MAPA: Record<NivelPrioridad, {etiqueta: string;texto: string;barra: string;nivel: number;}> = {
  alta: { etiqueta: 'Alta', texto: 'text-bad', barra: 'bg-bad', nivel: 3 },
  media: { etiqueta: 'Media', texto: 'text-warn', barra: 'bg-warn', nivel: 2 },
  baja: { etiqueta: 'Baja', texto: 'text-muted', barra: 'bg-muted', nivel: 1 }
};

export function PriorityBadge({ nivel, className }: {nivel: NivelPrioridad;className?: string;}) {
  const m = MAPA[nivel];
  return (
    <span
      className={cn('inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md border border-line px-2 text-xs font-medium', m.texto, className)}
      aria-label={`Prioridad ${m.etiqueta.toLowerCase()}`}>
      
      <span className="flex items-end gap-[2px]" aria-hidden="true">
        {[1, 2, 3].map((i) =>
        <span
          key={i}
          className={cn('w-[3px] rounded-sm', i <= m.nivel ? m.barra : 'bg-line')}
          style={{ height: 3 + i * 2.5 }} />

        )}
      </span>
      {m.etiqueta}
    </span>);

}