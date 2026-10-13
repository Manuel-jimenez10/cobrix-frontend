import React from 'react';
import { ArrowDownRightIcon, ArrowUpRightIcon } from 'lucide-react';
import type { BloqueDirector } from '../../types/director';
import { cn } from '../../utils/cn';
import { AnimatedValue } from '../ui/AnimatedValue';
import { Money } from '../ui/Money';

export function KpiBlock({ bloque }: {bloque: Extract<BloqueDirector, {tipo: 'kpi';}>;}) {
  const sube = bloque.variacion >= 0;
  const bueno = sube && bloque.mejorSi === 'sube' || !sube && bloque.mejorSi === 'baja';
  const Flecha = sube ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-xs text-muted">{bloque.etiqueta}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <AnimatedValue valor={bloque.valor}>{(v) => <Money valor={v} className="text-[28px] font-semibold leading-none" />}</AnimatedValue>
        <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium', bueno ? 'bg-ok/10 text-ok' : 'bg-bad/10 text-bad')}>
          <Flecha size={13} aria-hidden="true" />
          <span className="tabular-nums">
            {sube ? '+' : ''}
            {bloque.variacion.toFixed(1)}%
          </span>
          <span className="font-normal opacity-80">{bloque.detalle}</span>
        </span>
      </div>
    </div>);

}