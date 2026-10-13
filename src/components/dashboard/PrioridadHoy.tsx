import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import type { ClienteResumen } from '../../types/cobranza';
import { AgentAvatar } from '../ui/AgentAvatar';
import { Money } from '../ui/Money';

export function PrioridadHoy({ clientes }: {clientes: ClienteResumen[];}) {
  const top = clientes.
  filter((c) => c.deuda > 0 && c.estado !== 'promesa' && !c.escalado).
  sort((a, b) => b.prioridad.score - a.prioridad.score).
  slice(0, 4);

  return (
    <section className="flex min-w-0 flex-col rounded-2xl border border-line bg-surface" aria-labelledby="prioridad-titulo">
      <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
        <div className="flex items-center gap-2.5">
          <AgentAvatar agente="analista" tamano="sm" />
          <div>
            <h2 id="prioridad-titulo" className="text-sm font-medium">
              A quién cobrar hoy
            </h2>
            <p className="text-xs text-muted">Orden sugerido por el Analista</p>
          </div>
        </div>
        <Link to="/cartera" className="rounded-md px-2 py-1 text-xs text-muted transition-colors duration-150 hover:text-fg">
          Ver cartera
        </Link>
      </header>
      {top.length === 0 ?
      <p className="px-5 pb-6 pt-2 text-sm text-muted">No hay clientes pendientes de contactar.</p> :

      <ol className="divide-y divide-line">
          {top.map((c, i) =>
        <li key={c.id}>
              <Link to={`/cartera/${c.id}`} className="group flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-surface-2/60">
                <span className="w-4 text-xs tabular-nums text-muted">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{c.empresa}</span>
                  <span className="block truncate text-xs text-muted">{c.prioridad.razon}</span>
                </span>
                <span className="text-right">
                  <Money valor={c.deuda} className="block text-sm font-medium" />
                  <span className="text-xs tabular-nums text-bad">{c.diasAtraso} días</span>
                </span>
                <ChevronRightIcon size={16} className="text-muted transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
        )}
        </ol>
      }
    </section>);

}