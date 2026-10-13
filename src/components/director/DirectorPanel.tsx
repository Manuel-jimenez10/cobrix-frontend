import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2Icon, PlusIcon, XIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { useUI } from '../../contexts/UIContext';
import { EASE_DRAWER, teclaMod } from '../../utils/motion';
import { AgentAvatar } from '../ui/AgentAvatar';
import { IconButton } from '../ui/IconButton';
import { Kbd } from '../ui/Kbd';
import { DirectorChat } from './DirectorChat';

/** Panel lateral del Director, disponible desde cualquier pantalla (⌘J). */
export function DirectorPanel() {
  const { directorAbierto, setDirectorAbierto } = useUI();
  const { nueva, generando } = useDirector();
  const location = useLocation();
  const navigate = useNavigate();
  const enPaginaDirector = location.pathname.startsWith('/director');

  useEffect(() => {
    if (enPaginaDirector) setDirectorAbierto(false);
  }, [enPaginaDirector, setDirectorAbierto]);

  useEffect(() => {
    if (!directorAbierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDirectorAbierto(false);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [directorAbierto, setDirectorAbierto]);

  return (
    <AnimatePresence>
      {directorAbierto && !enPaginaDirector &&
      <motion.aside
        key="director"
        aria-label="Director"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.26, ease: EASE_DRAWER }}
        className="fixed inset-y-0 right-0 z-40 flex w-[440px] flex-col border-l border-line bg-bg shadow-2xl shadow-black/40">
        
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4">
            <AgentAvatar agente="director" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold">Director</h2>
              <p className="truncate text-xs text-muted">Responde sobre tu cartera con datos reales</p>
            </div>
            <Kbd>{teclaMod()}J</Kbd>
            <IconButton aria-label="Nueva conversación" onClick={nueva} disabled={generando}>
              <PlusIcon size={17} />
            </IconButton>
            <IconButton aria-label="Abrir en pantalla completa" onClick={() => navigate('/director')}>
              <Maximize2Icon size={16} />
            </IconButton>
            <IconButton aria-label="Cerrar Director" onClick={() => setDirectorAbierto(false)}>
              <XIcon size={18} />
            </IconButton>
          </header>
          <div className="min-h-0 flex-1">
            <DirectorChat compacto />
          </div>
        </motion.aside>
      }
    </AnimatePresence>);

}