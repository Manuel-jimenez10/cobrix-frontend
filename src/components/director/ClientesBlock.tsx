import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';
import type { BloqueDirector } from '../../types/director';
import { Money } from '../ui/Money';

export function ClientesBlock({ bloque }: {bloque: Extract<BloqueDirector, {tipo: 'clientes';}>;}) {
  const navigate = useNavigate();
  const { setDirectorAbierto } = useUI();
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <p className="border-b border-line px-4 py-2.5 text-xs text-muted">{bloque.titulo}</p>
      <ul className="divide-y divide-line">
        {bloque.clientes.map((c) =>
        <li key={c.id}>
            <button
            type="button"
            onClick={() => {
              setDirectorAbierto(false);
              navigate(`/cartera/${c.id}`);
            }}
            className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface-2/70">
            
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{c.empresa}</span>
                <span className="block truncate text-xs text-muted">{c.detalle}</span>
              </span>
              <Money valor={c.monto} className="text-sm font-medium" />
              <ChevronRightIcon size={16} className="text-muted transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          </li>
        )}
      </ul>
    </div>);

}