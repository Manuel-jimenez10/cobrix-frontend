import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheckIcon, CircleXIcon, ShieldCheckIcon } from 'lucide-react';
import type { BloqueDirector } from '../../types/director';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { ToneBadge } from '../ui/ToneBadge';

interface ConfirmBlockProps {
  bloque: Extract<BloqueDirector, {tipo: 'confirmacion';}>;
  deshabilitado: boolean;
  onResolver: (confirmar: boolean) => void;
}

export function ConfirmBlock({ bloque, deshabilitado, onResolver }: ConfirmBlockProps) {
  const pendiente = bloque.estado === 'pendiente';
  return (
    <div className={cn('rounded-xl border p-4 transition-colors duration-200', pendiente ? 'border-brand/35 bg-brand/[0.06]' : 'border-line bg-surface')}>
      <div className="flex items-start gap-3">
        <ShieldCheckIcon size={18} className={cn('mt-0.5 shrink-0', pendiente ? 'text-brand' : 'text-muted')} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium leading-snug">{bloque.mensaje}</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <ToneBadge tono={bloque.tono} />
            {bloque.clienteIds.length} clientes · requiere tu confirmación
          </p>
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {pendiente ?
        <motion.div key="acciones" exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="mt-4 flex gap-2 pl-[30px]">
            <Button variante="primario" tamano="sm" onClick={() => onResolver(true)} disabled={deshabilitado}>
              Confirmar
            </Button>
            <Button variante="fantasma" tamano="sm" onClick={() => onResolver(false)} disabled={deshabilitado}>
              Cancelar
            </Button>
          </motion.div> :

        <motion.p
          key="resuelto"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className={cn('mt-3 flex items-center gap-1.5 pl-[30px] text-sm font-medium', bloque.estado === 'confirmada' ? 'text-ok' : 'text-muted')}>
          
            {bloque.estado === 'confirmada' ? <CircleCheckIcon size={15} aria-hidden="true" /> : <CircleXIcon size={15} aria-hidden="true" />}
            {bloque.estado === 'confirmada' ? 'Confirmado' : 'Cancelado · no se envió nada'}
          </motion.p>
        }
      </AnimatePresence>
    </div>);

}