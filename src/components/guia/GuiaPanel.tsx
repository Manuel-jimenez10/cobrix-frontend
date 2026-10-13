import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LifeBuoyIcon, RotateCcwIcon, XIcon } from 'lucide-react';
import { useGuia } from '../../contexts/GuiaContext';
import { useUI } from '../../contexts/UIContext';
import { EASE_OUT } from '../../utils/motion';
import { IconButton } from '../ui/IconButton';
import { GuiaAvatar } from './GuiaAvatar';
import { GuiaChat } from './GuiaChat';

/** Escritorio: botón flotante de ayuda y panel de la Guía, disponible en cualquier pantalla. */
export function GuiaPanel() {
  const { abierto, setAbierto, reiniciar, generando, mensajes } = useGuia();
  const { directorAbierto } = useUI();

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto, setAbierto]);

  if (directorAbierto) return null;

  return (
    <>
      <AnimatePresence>
        {abierto &&
        <motion.aside
          key="guia"
          aria-label="Guía de Cobrix"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
          style={{ transformOrigin: 'bottom right' }}
          className="fixed bottom-24 right-6 z-40 flex h-[min(620px,calc(100dvh-140px))] w-[400px] flex-col overflow-hidden rounded-2xl border border-line bg-bg shadow-2xl shadow-black/40">

            <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4">
              <GuiaAvatar />
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold">Guía</h2>
                <p className="truncate text-xs text-muted">Te enseña a usar Cobrix</p>
              </div>
              {mensajes.length > 0 &&
            <IconButton aria-label="Nueva conversación" onClick={reiniciar} disabled={generando}>
                  <RotateCcwIcon size={16} />
                </IconButton>
            }
              <IconButton aria-label="Cerrar Guía" onClick={() => setAbierto(false)}>
                <XIcon size={18} />
              </IconButton>
            </header>
            <div className="min-h-0 flex-1">
              <GuiaChat />
            </div>
          </motion.aside>
        }
      </AnimatePresence>
      <motion.button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? 'Cerrar Guía' : 'Abrir Guía: ¿cómo uso Cobrix?'}
        aria-expanded={abierto}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium shadow-lg shadow-black/30 transition-colors hover:bg-surface-2">

        {abierto ? <XIcon size={18} aria-hidden="true" /> : <LifeBuoyIcon size={18} className="text-brand" aria-hidden="true" />}
        {abierto ? 'Cerrar' : '¿Necesitas ayuda?'}
      </motion.button>
    </>);

}
