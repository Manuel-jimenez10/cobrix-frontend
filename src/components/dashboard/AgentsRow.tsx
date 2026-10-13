import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AGENTES, ORDEN_AGENTES } from '../../data/agentes';
import type { AgenteId, EventoAgente } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { AgentAvatar } from '../ui/AgentAvatar';

interface AgentsRowProps {
  eventos: EventoAgente[];
  tareasHoy: Record<AgenteId, number>;
  /** Clientes que respondieron y esperan a una persona del equipo. */
  porAtender: number;
}

export function AgentsRow({ eventos, tareasHoy, porAtender }: AgentsRowProps) {
  return (
    <section aria-label="Estado de los agentes" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
      {ORDEN_AGENTES.map((id) => {
        const meta = AGENTES[id];
        const actual = eventos.find((e) => e.agente === id && e.estado === 'en_progreso');
        const esEquipo = id === 'negociador';
        const estado = esEquipo ?
        porAtender > 0 ? `${porAtender} ${porAtender === 1 ? 'cliente espera' : 'clientes esperan'} respuesta` : 'Nadie espera respuesta' :
        actual ? actual.accion : id === 'director' ? 'Listo para tus preguntas' : 'En espera';
        return (
          <div key={id} className="flex items-start gap-3 bg-surface p-4">
            <AgentAvatar agente={id} activo={Boolean(actual)} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className={cn('text-sm font-medium', meta.texto)}>{meta.nombre}</span>
                <span className="text-xs tabular-nums text-muted" aria-label={`${tareasHoy[id]} tareas hoy`}>
                  {tareasHoy[id]} hoy
                </span>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={actual ? actual.id : estado}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.16 }}
                  className={cn('mt-0.5 truncate text-xs', actual ? 'text-fg' : esEquipo && porAtender > 0 ? 'font-medium text-warn' : 'text-muted')}>

                  {estado}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>);

      })}
    </section>);

}