import React from 'react';
import { motion } from 'framer-motion';
import { sugerenciasDirector } from '../../data/agentes';
import { EASE_OUT } from '../../utils/motion';
import { AgentAvatar } from '../ui/AgentAvatar';

export function DirectorBienvenida({ onSugerencia, compacto }: {onSugerencia: (texto: string) => void;compacto?: boolean;}) {
  return (
    <div className="flex flex-col items-center py-8 text-center lg:py-14">
      <AgentAvatar agente="director" tamano="lg" />
      <h2 className="mt-4 text-xl font-semibold tracking-tight">¿En qué te ayudo hoy?</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Coordino al Analista, al Redactor y al Negociador. Pregúntame por tu cartera o pídeme una acción: nada se ejecuta sin tu confirmación.
      </p>
      <div className={compacto ? 'mt-6 grid w-full gap-2' : 'mt-8 grid w-full max-w-lg gap-2 sm:grid-cols-2'}>
        {sugerenciasDirector.map((s, i) =>
        <motion.button
          key={s}
          type="button"
          onClick={() => onSugerencia(s)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, delay: i * 0.04, ease: EASE_OUT }}
          className="min-h-[48px] rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm font-medium transition-colors duration-150 hover:border-muted/40 hover:bg-surface-2">
          
            {s}
          </motion.button>
        )}
      </div>
    </div>);

}