import React from 'react';
import { ArrowUpDownIcon, SearchIcon, XIcon } from 'lucide-react';
import type { EstadoCliente, FiltrosClientes, NivelPrioridad, OrdenClientes } from '../../types/cobranza';
import { cn } from '../../utils/cn';

const ESTADOS: {valor: EstadoCliente | 'todos';etiqueta: string;}[] = [
{ valor: 'todos', etiqueta: 'Todos' },
{ valor: 'vencido', etiqueta: 'Vencidos' },
{ valor: 'por_vencer', etiqueta: 'Por vencer' },
{ valor: 'promesa', etiqueta: 'Con promesa' },
{ valor: 'al_dia', etiqueta: 'Al día' }];


const PRIORIDADES: {valor: NivelPrioridad;etiqueta: string;}[] = [
{ valor: 'alta', etiqueta: 'Prioridad alta' },
{ valor: 'media', etiqueta: 'Media' },
{ valor: 'baja', etiqueta: 'Baja' }];


const ORDENES: {valor: OrdenClientes;etiqueta: string;}[] = [
{ valor: 'prioridad', etiqueta: 'Prioridad' },
{ valor: 'monto', etiqueta: 'Monto' },
{ valor: 'atraso', etiqueta: 'Días de atraso' },
{ valor: 'nombre', etiqueta: 'Nombre' }];


interface FiltrosBarProps {
  filtros: FiltrosClientes;
  onChange: (f: FiltrosClientes) => void;
  className?: string;
}

function Chip({ activo, onClick, children }: {activo: boolean;onClick: () => void;children: React.ReactNode;}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={cn(
        'h-10 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition-colors duration-150 lg:h-8 lg:px-3 lg:text-[13px]',
        activo ? 'border-fg bg-fg text-bg' : 'border-line text-muted hover:border-muted/50 hover:text-fg'
      )}>
      
      {children}
    </button>);

}

export function FiltrosBar({ filtros, onChange, className }: FiltrosBarProps) {
  const set = (parcial: Partial<FiltrosClientes>) => onChange({ ...filtros, ...parcial });
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor="buscar-clientes" className="sr-only">
            Buscar clientes
          </label>
          <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="buscar-clientes"
            type="search"
            value={filtros.busqueda ?? ''}
            onChange={(e) => set({ busqueda: e.target.value })}
            placeholder="Buscar empresa, contacto o folio"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-9 pr-9 text-[15px] placeholder:text-muted focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/25 lg:h-9 lg:rounded-lg lg:text-sm" />
          
          {filtros.busqueda &&
          <button type="button" onClick={() => set({ busqueda: '' })} aria-label="Limpiar búsqueda" className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-fg lg:h-7 lg:w-7">
              <XIcon size={15} />
            </button>
          }
        </div>
        <div className="relative">
          <label htmlFor="orden-clientes" className="sr-only">
            Ordenar por
          </label>
          <ArrowUpDownIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <select
            id="orden-clientes"
            value={filtros.orden ?? 'prioridad'}
            onChange={(e) => set({ orden: e.target.value as OrdenClientes })}
            className="h-11 appearance-none rounded-xl border border-line bg-surface pl-8 pr-3 text-sm text-fg focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/25 lg:h-9 lg:rounded-lg">
            
            {ORDENES.map((o) =>
            <option key={o.valor} value={o.valor}>
                {o.etiqueta}
              </option>
            )}
          </select>
        </div>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0" role="group" aria-label="Filtros">
        {ESTADOS.map((e) =>
        <Chip key={e.valor} activo={(filtros.estado ?? 'todos') === e.valor} onClick={() => set({ estado: e.valor })}>
            {e.etiqueta}
          </Chip>
        )}
        <span className="my-2 w-px shrink-0 bg-line" aria-hidden="true" />
        {PRIORIDADES.map((p) =>
        <Chip key={p.valor} activo={filtros.prioridad === p.valor} onClick={() => set({ prioridad: filtros.prioridad === p.valor ? 'todas' : p.valor })}>
            {p.etiqueta}
          </Chip>
        )}
      </div>
    </div>);

}