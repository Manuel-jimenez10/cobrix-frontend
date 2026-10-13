import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { EstadoCliente } from '../../types/cobranza';
import { cn } from '../../utils/cn';

const MAPA: Record<EstadoCliente, {etiqueta: string;clase: string;punto: string;}> = {
  al_dia: { etiqueta: 'Al día', clase: 'bg-ok/10 text-ok', punto: 'bg-ok' },
  por_vencer: { etiqueta: 'Por vencer', clase: 'bg-warn/10 text-warn', punto: 'bg-warn' },
  vencido: { etiqueta: 'Vencido', clase: 'bg-bad/10 text-bad', punto: 'bg-bad' },
  promesa: { etiqueta: 'Promesa de pago', clase: 'bg-promise/10 text-promise', punto: 'bg-promise' }
};

export function StatusBadge({ estado, className }: {estado: EstadoCliente;className?: string;}) {
  const m = MAPA[estado];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={estado}
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.16 }}
        className={cn('inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-xs font-medium', m.clase, className)}>
        
        <span className={cn('h-1.5 w-1.5 rounded-full', m.punto)} aria-hidden="true" />
        {m.etiqueta}
      </motion.span>
    </AnimatePresence>);

}