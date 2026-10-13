import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BanknoteIcon,
  CalendarCheckIcon,
  ListOrderedIcon,
  LoaderCircleIcon,
  MessageCircleIcon,
  ReplyIcon,
  SendIcon,
  ShieldAlertIcon,
  TriangleAlertIcon } from
'lucide-react';
import { useAhora } from '../../hooks/useAhora';
import type { EventoAgente } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { tiempoRelativo } from '../../utils/format';
import { EASE_OUT } from '../../utils/motion';
import { Skeleton } from '../ui/Skeleton';

interface ActividadRecienteProps {
  eventos: EventoAgente[];
  limite?: number;
  cargando?: boolean;
  className?: string;
}

/** Ícono y color según lo que pasó (no según quién lo hizo). */
function tipoDe(ev: EventoAgente) {
  const a = ev.accion.toLowerCase();
  if (ev.estado === 'error') return { Icono: TriangleAlertIcon, color: 'bg-bad/15 text-bad' };
  if (a.includes('te escribió')) return { Icono: MessageCircleIcon, color: 'bg-warn/15 text-warn' };
  if (a.includes('respondiste')) return { Icono: ReplyIcon, color: 'bg-brand/15 text-brand' };
  if (a.includes('cumplida') || a.includes('pago registrado')) return { Icono: BanknoteIcon, color: 'bg-ok/15 text-ok' };
  if (a.includes('promesa')) return { Icono: CalendarCheckIcon, color: 'bg-promise/15 text-promise' };
  if (a.includes('recordatorio')) return { Icono: SendIcon, color: 'bg-surface-2 text-fg' };
  if (a.includes('revisión')) return { Icono: ShieldAlertIcon, color: 'bg-bad/10 text-bad' };
  return { Icono: ListOrderedIcon, color: 'bg-surface-2 text-muted' };
}

export function ActividadReciente({ eventos, limite = 14, cargando = false, className }: ActividadRecienteProps) {
  const ahora = useAhora(20_000);
  const navigate = useNavigate();
  const visibles = eventos.slice(0, limite);

  return (
    <section className={cn('flex min-h-0 flex-col', className)} aria-labelledby="actividad-titulo">
      <header className="px-5 py-4">
        <h2 id="actividad-titulo" className="text-sm font-medium">
          Actividad reciente
        </h2>
      </header>

      {cargando ?
      <div className="space-y-5 px-5 py-2">
          {Array.from({ length: 6 }).map((_, i) =>
        <div key={i} className="flex gap-3">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
        )}
        </div> :
      visibles.length === 0 ?
      <p className="px-5 py-8 text-center text-sm text-muted">Aún no hay actividad. Envía recordatorios o contesta a un cliente y aparecerá aquí.</p> :

      <ol className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-live="polite">
          <AnimatePresence initial={false}>
            {visibles.map((ev, i) => {
            const { Icono, color } = tipoDe(ev);
            const enCurso = ev.estado === 'en_progreso';
            const contenido =
            <>
                  <span className="relative flex flex-col items-center">
                    <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full', color)} aria-hidden="true">
                      {enCurso ? <LoaderCircleIcon size={13} className="motion-safe:animate-spin" /> : <Icono size={13} strokeWidth={2.2} />}
                    </span>
                    {i < visibles.length - 1 && <span className="mt-1 w-px flex-1 bg-line" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1 pb-4">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="min-w-0 truncate text-sm text-fg">{ev.accion}</span>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted">{enCurso ? 'ahora' : tiempoRelativo(ev.fecha, ahora)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">{ev.detalle}</span>
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
