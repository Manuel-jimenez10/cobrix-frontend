import React, { useEffect, useId } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { EASE_DRAWER } from '../../utils/motion';
import type { DialogProps } from './Modal';

/** Hoja inferior arrastrable: se cierra deslizando hacia abajo. */
export function BottomSheet({ abierto, onCerrar, titulo, descripcion, children }: DialogProps) {
  const controles = useDragControls();
  const tituloId = useId();

  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar?.();
    };
    window.addEventListener('keydown', alTeclear);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener('keydown', alTeclear);
    };
  }, [abierto, onCerrar]);

  return (
    <AnimatePresence>
      {abierto &&
      <div className="fixed inset-0 z-50">
          <motion.div
          className="absolute inset-0 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCerrar} />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={tituloId}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.28, ease: EASE_DRAWER }}
          drag={onCerrar ? 'y' : false}
          dragControls={controles}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.7 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 110 || info.velocity.y > 500) onCerrar?.();
          }}
          className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-3xl border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
          
            <div
            onPointerDown={(e) => onCerrar && controles.start(e)}
            className="flex cursor-grab touch-none flex-col items-center px-5 pb-2 pt-2.5 active:cursor-grabbing">
            
              <span className="h-1.5 w-10 rounded-full bg-line" aria-hidden="true" />
              <div className="mt-3 w-full">
                <h2 id={tituloId} className="text-[17px] font-semibold">
                  {titulo}
                </h2>
                {descripcion && <p className="mt-0.5 text-sm text-muted">{descripcion}</p>}
              </div>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-5 pt-2">{children}</div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}