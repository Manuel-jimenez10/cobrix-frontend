import React from 'react';
import { RotateCcwIcon } from 'lucide-react';
import { GuiaChat } from '../components/guia/GuiaChat';
import { MobileHeader } from '../components/layout/MobileHeader';
import { IconButton } from '../components/ui/IconButton';
import { useGuia } from '../contexts/GuiaContext';

/** Móvil: la Guía ocupa la pantalla completa (en escritorio vive en un panel flotante). */
export function Guia() {
  const { reiniciar, generando, mensajes } = useGuia();
  return (
    <div className="flex h-[100dvh] flex-col pb-[calc(64px+env(safe-area-inset-bottom))]">
      <MobileHeader
        titulo="Guía"
        colapsable={false}
        acciones={
        mensajes.length > 0 &&
        <IconButton aria-label="Nueva conversación" onClick={reiniciar} disabled={generando}>
              <RotateCcwIcon size={18} />
            </IconButton>

        } />

      <div className="min-h-0 flex-1">
        <GuiaChat />
      </div>
    </div>);

}
