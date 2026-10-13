import React, { type ReactNode, useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { EASE_OUT } from '../../utils/motion';
import { IconButton } from './IconButton';

export interface DialogProps {
  abierto: boolean;
  /** Si se omite, el diálogo no puede cerrarse (p. ej. durante un proceso). */
  onCerrar?: () => void;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}

export function Modal({ abierto, onCerrar, titulo, descripcion, children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const tituloId = useId();

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar?.();
    };
    window.addEventListener('keydown', alTeclear);
    panelRef.current?.focus();
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto, onCerrar]);

  return (
    <AnimatePresence>
      {abierto &&
      <div className="fixed inset-0 z-50 grid place-items-center p-6">
          <motion.div
          className="absolute inset-0 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCerrar} />
        
          <motion.div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={tituloId}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="relative w-full max-w-lg rounded-2xl border border-line bg-surface shadow-2xl shadow-black/40 focus:outline-none">
          
            <header className="flex items-start justify-between gap-4 px-6 pt-5">
              <div>
                <h2 id={tituloId} className="text-base font-semibold">
                  {titulo}
                </h2>
                {descripcion && <p className="mt-1 text-sm text-muted">{descripcion}</p>}
              </div>
              {onCerrar &&
            <IconButton aria-label="Cerrar" onClick={onCerrar} className="-mr-2 -mt-1">
                  <XIcon size={18} />
                </IconButton>
            }
            </header>
            <div className="max-h-[72vh] overflow-y-auto px-6 pb-6 pt-4">{children}</div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}