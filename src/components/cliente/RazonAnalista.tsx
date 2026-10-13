import React from 'react';
import { motion } from 'framer-motion';
import type { Prioridad } from '../../types/cobranza';
import { EASE_OUT } from '../../utils/motion';
import { AgentAvatar } from '../ui/AgentAvatar';
import { PriorityBadge } from '../ui/PriorityBadge';

export function RazonAnalista({ prioridad }: {prioridad: Prioridad;}) {
  return (
    <section aria-labelledby="razon-titulo">
      <div className="flex items-center gap-2.5">
        <AgentAvatar agente="analista" tamano="sm" />
        <h3 id="razon-titulo" className="text-sm font-medium">
          Por qué el Analista lo priorizó
        </h3>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <PriorityBadge nivel={prioridad.nivel} />
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={prioridad.score} aria-label="Score de prioridad">
          <motion.div className="h-full rounded-full bg-analista" initial={{ width: 0 }} animate={{ width: `${prioridad.score}%` }} transition={{ duration: 0.3, ease: EASE_OUT }} />
        </div>
        <span className="text-sm tabular-nums text-muted">{prioridad.score}/100</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{prioridad.razon}</p>
    </section>);

}