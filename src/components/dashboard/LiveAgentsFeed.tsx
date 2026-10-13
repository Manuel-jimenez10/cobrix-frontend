import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LoaderCircleIcon, TriangleAlertIcon } from 'lucide-react';
import { AGENTES } from '../../data/agentes';
import { useAhora } from '../../hooks/useAhora';
import type { EventoAgente } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { tiempoRelativo } from '../../utils/format';
import { EASE_OUT } from '../../utils/motion';
import { AgentAvatar } from '../ui/AgentAvatar';
import { Skeleton } from '../ui/Skeleton';

interface LiveAgentsFeedProps {
  eventos: EventoAgente[];
  limite?: number;
  cargando?: boolean;
  className?: string;
}

export function LiveAgentsFeed({ eventos, limite = 14, cargando = false, className }: LiveAgentsFeedProps) {
  const ahora = useAhora(20_000);
  const navigate = useNavigate();
  const reducir = useReducedMotion();
  const visibles = eventos.slice(0, limite);

  return (
    <section className={cn('flex min-h-0 flex-col', className)} aria-labelledby="vivo-titulo">
      <header className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 id="vivo-titulo" className="text-sm font-medium">
          Agentes en vivo
        </h2>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            {!reducir && <span className="absolute inset-0 rounded-full bg-brand opacity-60 motion-safe:animate-ping" />}
            <span className="relative h-2 w-2 rounded-full bg-brand" />
          </span>
          En tiempo real
        </span>
      </header>

      {cargando ?
      <div className="space-y-5 px-5 py-2">
          {Array.from({ length: 6 }).map((_, i) =>
        <div key={i} className="flex gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
        )}
        </div> :
      visibles.length === 0 ?
      <p className="px-5 py-8 text-center text-sm text-muted">Los agentes están en espera. Inicia una cobranza para verlos trabajar.</p> :

      <ol className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-live="polite">
          <AnimatePresence initial={false}>
            {visibles.map((ev, i) => {
            const meta = AGENTES[ev.agente];
            const enCurso = ev.estado === 'en_progreso';
            const esError = ev.estado === 'error';
            const contenido =
            <>
                  <span className="relative flex flex-col items-center">
                    <AgentAvatar agente={ev.agente} tamano="sm" activo={enCurso} />
                    {i < visibles.length - 1 && <span className="mt-1 w-px flex-1 bg-line" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1 pb-4">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="min-w-0 truncate text-sm">
                        <span className={cn('font-medium', meta.texto)}>{meta.nombre}</span>{' '}
                        <span className="text-fg">{ev.accion.charAt(0).toLowerCase() + ev.accion.slice(1)}</span>
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted">{tiempoRelativo(ev.fecha, ahora)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">{ev.detalle}</span>
                    {(enCurso || esError) &&
                <span className={cn('mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium', esError ? 'text-bad' : meta.texto)}>
                        {esError ? <TriangleAlertIcon size={11} aria-hidden="true" /> : <LoaderCircleIcon size={11} className="motion-safe:animate-spin" aria-hidden="true" />}
                        {esError ? 'Requiere atención' : 'En curso'}
                      </span>
                }
                  </span>
                </>;

            return (
              <motion.li
                key={ev.id}
                layout="position"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: EASE_OUT }}>
                
                  {ev.clienteId ?
                <button
                  type="button"
                  onClick={() => navigate(`/cartera/${ev.clienteId}`)}
                  className="flex w-full gap-3 rounded-lg px-2 pt-2 text-left transition-colors duration-150 hover:bg-surface-2/70">
                  
                      {contenido}
                    </button> :

                <div className="flex gap-3 px-2 pt-2">{contenido}</div>
                }
                </motion.li>);

          })}
          </AnimatePresence>
        </ol>
      }
    </section>);

}