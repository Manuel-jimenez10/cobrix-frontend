import React, { useState } from 'react';
import { HistoryIcon, PlusIcon } from 'lucide-react';
import { ConversacionesList } from '../components/director/ConversacionesList';
import { DirectorChat } from '../components/director/DirectorChat';
import { MobileHeader } from '../components/layout/MobileHeader';
import { AgentAvatar } from '../components/ui/AgentAvatar';
import { BottomSheet } from '../components/ui/BottomSheet';
import { IconButton } from '../components/ui/IconButton';
import { useDirector } from '../contexts/DirectorContext';
import { useEsEscritorio } from '../hooks/useMediaQuery';

export function Director() {
  const escritorio = useEsEscritorio();
  const { activa, nueva, generando } = useDirector();
  const [historial, setHistorial] = useState(false);

  if (escritorio) {
    return (
      <div className="grid h-[100dvh] grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-line">
          <div className="flex h-16 shrink-0 items-center gap-3 px-5">
            <AgentAvatar agente="director" />
            <h1 className="text-lg font-semibold tracking-tight">Director</h1>
          </div>
          <ConversacionesList />
        </aside>
        <section className="flex min-h-0 flex-col" aria-label="Chat con el Director">
          <header className="flex h-16 shrink-0 items-center border-b border-line px-8">
            <h2 className="truncate text-sm font-medium">{activa.titulo}</h2>
          </header>
          <div className="min-h-0 flex-1">
            <DirectorChat />
          </div>
        </section>
      </div>);

  }

  return (
    <div className="flex h-[100dvh] flex-col pb-[calc(64px+env(safe-area-inset-bottom))]">
      <MobileHeader
        titulo="Director"
        colapsable={false}
        acciones={
        <>
            <IconButton aria-label="Nueva conversación" onClick={nueva} disabled={generando}>
              <PlusIcon size={20} />
            </IconButton>
            <IconButton aria-label="Historial de conversaciones" onClick={() => setHistorial(true)}>
              <HistoryIcon size={19} />
            </IconButton>
          </>
        } />
      
      <div className="min-h-0 flex-1">
        <DirectorChat compacto />
      </div>
      <BottomSheet abierto={historial} onCerrar={() => setHistorial(false)} titulo="Conversaciones">
        <div className="-mx-5">
          <ConversacionesList onSeleccion={() => setHistorial(false)} />
        </div>
      </BottomSheet>
    </div>);

}