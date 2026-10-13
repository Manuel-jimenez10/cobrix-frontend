import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { EstadoPromesa, PromesaPago } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { formatFecha, relativoDias } from '../../utils/format';
import { EASE_OUT } from '../../utils/motion';
import { Money } from '../ui/Money';

const ESTADOS: Record<EstadoPromesa, {etiqueta: string;clase: string;}> = {
  pendiente: { etiqueta: 'Pendiente', clase: 'bg-promise/10 text-promise' },
  cumplida: { etiqueta: 'Cumplida', clase: 'bg-ok/10 text-ok' },
  incumplida: { etiqueta: 'Incumplida', clase: 'bg-bad/10 text-bad' }
};

export function PromesasCliente({ promesas }: {promesas: PromesaPago[];}) {
  return (
    <section aria-labelledby="promesas-cliente-titulo">
      <h3 id="promesas-cliente-titulo" className="text-sm font-medium">
        Promesas de pago
      </h3>
      {promesas.length === 0 ?
      <p className="mt-3 text-sm text-muted">Sin promesas registradas.</p> :

      <ul className="mt-2 divide-y divide-line">
          <AnimatePresence initial={false}>
            {promesas.map((p) =>
          <motion.li
            key={p.id}
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="flex items-center justify-between gap-3 py-3">
            
                <div>
                  <Money valor={p.monto} className="text-sm font-medium" />
                  <p className="mt-0.5 text-xs text-muted">
                    {formatFecha(p.fechaCompromiso)} · {relativoDias(p.fechaCompromiso)}
                  </p>
                </div>
                <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', ESTADOS[p.estado].clase)}>{ESTADOS[p.estado].etiqueta}</span>
              </motion.li>
          )}
          </AnimatePresence>
        </ul>
      }
    </section>);

}