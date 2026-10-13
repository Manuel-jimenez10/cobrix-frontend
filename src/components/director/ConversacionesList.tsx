import React from 'react';
import { MessageSquareIcon, PlusIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { useAhora } from '../../hooks/useAhora';
import { cn } from '../../utils/cn';
import { tiempoRelativo } from '../../utils/format';
import { Button } from '../ui/Button';

export function ConversacionesList({ onSeleccion }: {onSeleccion?: () => void;}) {
  const { conversaciones, activa, seleccionar, nueva, generando } = useDirector();
  const ahora = useAhora();
  return (
    <div className="flex min-h-0 flex-col">
      <div className="px-3 pb-2">
        <Button
          variante="secundario"
          icono={PlusIcon}
          className="w-full justify-start"
          disabled={generando}
          onClick={() => {
            nueva();
            onSeleccion?.();
          }}>
          
          Nueva conversación
        </Button>
      </div>
      <p className="px-5 pb-1 pt-3 text-xs text-muted">Recientes</p>
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {conversaciones.
        filter((c) => c.mensajes.length > 0 || c.id === activa.id).
        map((c) => {
          const activo = c.id === activa.id;
          return (
            <li key={c.id}>
                <button
                type="button"
                disabled={generando && !activo}
                onClick={() => {
                  seleccionar(c.id);
                  onSeleccion?.();
                }}
                aria-current={activo ? 'true' : undefined}
                className={cn('flex min-h-[44px] w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 disabled:opacity-50', activo ? 'bg-surface-2 text-fg' : 'text-muted hover:bg-surface-2/60 hover:text-fg')}>
                
                  <MessageSquareIcon size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{c.titulo}</span>
                    <span className="block text-xs text-muted">{c.mensajes.length ? tiempoRelativo(c.fecha, ahora) : 'Sin mensajes'}</span>
                  </span>
                </button>
              </li>);

        })}
      </ul>
    </div>);

}