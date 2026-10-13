import React from 'react';
import { CheckIcon, MailIcon, PhoneIcon, SparklesIcon, TriangleAlertIcon } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';
import type { ClienteDetalle } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { ChannelBadge } from '../ui/ChannelBadge';
import { Money } from '../ui/Money';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusBadge } from '../ui/StatusBadge';

interface ClienteEncabezadoProps {
  detalle: ClienteDetalle;
  modo: 'panel' | 'pantalla';
  onMarcarPagada: () => void;
}

export function ClienteEncabezado({ detalle, modo, onMarcarPagada }: ClienteEncabezadoProps) {
  const { abrirCobranza } = useUI();
  const c = detalle.cliente;
  const escalamiento = detalle.escalamientos.find((e) => !e.resuelto);

  return (
    <header className="border-b border-line px-4 py-4 lg:px-6 lg:py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {modo === 'panel' ? <h2 className="truncate text-xl font-semibold tracking-tight">{c.empresa}</h2> : <p className="truncate text-lg font-semibold tracking-tight">{c.empresa}</p>}
          <p className="mt-0.5 truncate text-sm text-muted">{c.nombre}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <a href={`tel:${c.telefono.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 tabular-nums hover:text-fg">
              <PhoneIcon size={12} aria-hidden="true" />
              {c.telefono}
            </a>
            <a href={`mailto:${c.email}`} className="hidden items-center gap-1 hover:text-fg sm:inline-flex">
              <MailIcon size={12} aria-hidden="true" />
              {c.email}
            </a>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted">Adeudo</p>
          <Money valor={c.deuda} className="block text-2xl font-semibold lg:text-[28px]" />
          <p className={cn('text-xs tabular-nums', c.diasAtraso > 60 ? 'text-bad' : c.diasAtraso > 0 ? 'text-warn' : 'text-muted')}>
            {c.diasAtraso > 0 ? `${c.diasAtraso} días de atraso` : c.deuda > 0 ? 'Sin atraso' : 'Liquidado'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <StatusBadge estado={c.estado} />
        {c.deuda > 0 && <PriorityBadge nivel={c.prioridad.nivel} />}
        <ChannelBadge canal={c.canal} />
      </div>

      {escalamiento &&
      <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl border border-bad/30 bg-bad/[0.08] px-3.5 py-3">
          <TriangleAlertIcon size={16} className="mt-0.5 shrink-0 text-bad" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-medium text-bad">Escalado a humano</p>
            <p className="mt-0.5 text-muted">{escalamiento.motivo}</p>
          </div>
        </div>
      }

      <div className="mt-4 flex gap-2">
        <Button variante="primario" icono={SparklesIcon} onClick={() => abrirCobranza([c.id])} disabled={c.deuda === 0 || c.escalado} className="flex-1 lg:flex-none">
          Cobrar con IA
        </Button>
        <Button variante="secundario" icono={CheckIcon} onClick={onMarcarPagada} disabled={c.deuda === 0} className="flex-1 lg:flex-none">
          Marcar pagada
        </Button>
      </div>
    </header>);

}