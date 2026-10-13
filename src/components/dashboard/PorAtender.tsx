import React from 'react';
import { Link } from 'react-router-dom';
import { BellRingIcon, ChevronRightIcon } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';
import type { ClienteResumen } from '../../types/cobranza';
import { tiempoRelativo } from '../../utils/format';
import { Money } from '../ui/Money';

/** Clientes que respondieron y esperan a una persona del equipo. Es lo primero que hay que hacer en el día. */
export function PorAtender({ clientes }: {clientes: ClienteResumen[];}) {
  const { setFiltrosCartera } = useUI();
  const lista = clientes.
  filter((c) => c.requiereAtencion).
  sort((a, b) => (b.ultimoMensaje?.fecha ?? '').localeCompare(a.ultimoMensaje?.fecha ?? ''));
  if (!lista.length) return null;

  return (
    <section data-tour="por-atender" aria-labelledby="atencion-titulo" className="overflow-hidden rounded-2xl border border-warn/30 bg-warn/[0.05]">
      <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-warn/15 text-warn" aria-hidden="true">
            <BellRingIcon size={15} />
          </span>
          <div>
            <h2 id="atencion-titulo" className="text-sm font-medium">
              Requieren tu atención
            </h2>
            <p className="text-xs text-muted">Te escribieron y esperan tu respuesta. Sus recordatorios están en pausa.</p>
          </div>
        </div>
        {lista.length > 3 &&
        <Link
          to="/cartera"
          onClick={() => setFiltrosCartera((f) => ({ ...f, atencion: true }))}
          className="shrink-0 rounded-md px-2 py-1 text-xs text-muted hover:text-fg">

            Ver todos
          </Link>
        }
      </header>
      <ul className="divide-y divide-warn/15">
        {lista.slice(0, 3).map((c) =>
        <li key={c.id} className="min-w-0">
            <Link to={`/cartera/${c.id}`} className="group flex min-w-0 items-center gap-3 px-5 py-3 transition-colors hover:bg-warn/[0.06]">
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium">{c.empresa}</span>
                  <Money valor={c.deuda} className="shrink-0 text-sm text-muted" />
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  “{c.ultimoMensaje?.contenido}” · {c.ultimoMensaje ? tiempoRelativo(c.ultimoMensaje.fecha) : ''}
                </span>
              </span>
              <span className="hidden shrink-0 rounded-md bg-warn/15 px-2 py-1 text-xs font-medium text-warn sm:inline">Responder</span>
              <ChevronRightIcon size={16} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
        )}
      </ul>
    </section>);

}
