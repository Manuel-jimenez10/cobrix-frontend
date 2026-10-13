import React from 'react';
import { motion } from 'framer-motion';
import type { TramoAntiguedad } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { formatMXN, formatMXNCorto } from '../../utils/format';
import { EASE_OUT } from '../../utils/motion';

const COLORES = ['bg-warn/55', 'bg-warn', 'bg-bad/70', 'bg-bad'];

export function AgingChart({ tramos }: {tramos: TramoAntiguedad[];}) {
  const max = Math.max(...tramos.map((t) => t.monto), 1);
  const total = tramos.reduce((s, t) => s + t.monto, 0);
  const resumen = tramos.map((t) => `${t.rango} días: ${formatMXN(t.monto)}`).join('; ');

  return (
    <section className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="antiguedad-titulo">
      <header className="flex items-baseline justify-between gap-3">
        <h2 id="antiguedad-titulo" className="text-sm font-medium">
          Cartera por antigüedad
        </h2>
        <span className="text-xs text-muted">Días de atraso</span>
      </header>
      <div className="mt-5 grid h-52 grid-cols-4 gap-3" role="img" aria-label={`Cartera por antigüedad. ${resumen}`}>
        {tramos.map((t, i) => {
          const pct = t.monto / max;
          const share = total ? Math.round(t.monto / total * 100) : 0;
          return (
            <div key={t.rango} className="flex h-full min-w-0 flex-col gap-2">
              <div className="text-center">
                <div className="truncate text-[13px] font-medium tabular-nums">{formatMXNCorto(t.monto)}</div>
                <div className="text-[11px] tabular-nums text-muted">{share}%</div>
              </div>
              <div className="relative flex-1">
                <motion.div
                  className={cn('absolute inset-x-0 bottom-0 rounded-md', COLORES[i])}
                  style={{ height: `${Math.max(pct * 100, 3)}%`, originY: 1 }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05, ease: EASE_OUT }} />
                
              </div>
              <div className="text-center">
                <div className="text-xs font-medium">{t.rango}</div>
                <div className="text-[11px] text-muted">
                  {t.clientes} {t.clientes === 1 ? 'cliente' : 'clientes'}
                </div>
              </div>
            </div>);

        })}
      </div>
    </section>);

}