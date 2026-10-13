import React from 'react';
import { motion } from 'framer-motion';
import type { BloqueDirector } from '../../types/director';
import { cn } from '../../utils/cn';
import { formatMXN } from '../../utils/format';
import { EASE_OUT } from '../../utils/motion';
import { Money } from '../ui/Money';

export function ChartBlock({ bloque }: {bloque: Extract<BloqueDirector, {tipo: 'grafica';}>;}) {
  const max = Math.max(...bloque.puntos.map((p) => p.valor), 1);
  const ultimo = bloque.puntos.length - 1;
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs text-muted">{bloque.titulo}</p>
        <p className="text-xs text-muted">
          Total <Money valor={bloque.total} className="font-medium text-fg" />
        </p>
      </div>
      <div className="mt-4 flex h-24 items-end gap-1.5" role="img" aria-label={`${bloque.titulo}: ${bloque.puntos.map((p) => `${p.etiqueta} ${formatMXN(p.valor)}`).join(', ')}`}>
        {bloque.puntos.map((p, i) =>
        <div key={p.etiqueta} className="relative h-full flex-1">
            <motion.div
            className={cn('absolute inset-x-0 bottom-0 rounded-[4px]', i === ultimo ? 'bg-brand' : 'bg-brand/30')}
            style={{ height: `${p.valor / max * 100}%`, originY: 1 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: i * 0.03, ease: EASE_OUT }} />
          
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted">
        <span>{bloque.puntos[0]?.etiqueta}</span>
        <span>{bloque.puntos[ultimo]?.etiqueta}</span>
      </div>
    </div>);

}