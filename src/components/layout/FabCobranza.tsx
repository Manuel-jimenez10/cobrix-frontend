import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SendIcon } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';
import { useScrolled } from '../../hooks/useScrolled';
import { EASE_OUT } from '../../utils/motion';

/** Botón flotante en la zona del pulgar. Se compacta al hacer scroll. */
export function FabCobranza() {
  const { abrirCobranza } = useUI();
  const scrolled = useScrolled(120);
  return (
    <motion.button
      type="button"
      layout
      onClick={() => abrirCobranza()}
      data-tour="iniciar-cobranza"
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      aria-label="Iniciar cobranza: enviar recordatorios"
      className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 items-center gap-2 rounded-full bg-brand px-5 font-semibold text-on-brand shadow-lg shadow-black/30"
      style={{ borderRadius: 999 }}>
      
      <motion.span layout="position">
        <SendIcon size={20} aria-hidden="true" />
      </motion.span>
      <AnimatePresence initial={false}>
        {!scrolled &&
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
          className="overflow-hidden whitespace-nowrap text-[15px]">
          
            Iniciar cobranza
          </motion.span>
        }
      </AnimatePresence>
    </motion.button>);

}