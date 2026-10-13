import React from 'react';
import type { Tono } from '../../types/cobranza';
import { cn } from '../../utils/cn';

const MAPA: Record<Tono, {etiqueta: string;clase: string;}> = {
  amable: { etiqueta: 'Amable', clase: 'bg-ok/10 text-ok' },
  firme: { etiqueta: 'Firme', clase: 'bg-warn/10 text-warn' },
  final: { etiqueta: 'Final', clase: 'bg-bad/10 text-bad' }
};

export function ToneBadge({ tono, className }: {tono: Tono;className?: string;}) {
  const m = MAPA[tono];
  return (
    <span className={cn('inline-flex h-5 items-center rounded px-1.5 text-[11px] font-medium', m.clase, className)}>
      {m.etiqueta}
    </span>);

}