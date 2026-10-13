import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon } from 'lucide-react';
import { useScrolled } from '../../hooks/useScrolled';
import { cn } from '../../utils/cn';
import { IconButton } from '../ui/IconButton';
import { Logo } from './Logo';

interface MobileHeaderProps {
  titulo: string;
  subtitulo?: ReactNode;
  acciones?: ReactNode;
  onVolver?: () => void;
  /** Título grande que se colapsa a la barra al hacer scroll. */
  colapsable?: boolean;
}

export function MobileHeader({ titulo, subtitulo, acciones, onVolver, colapsable = true }: MobileHeaderProps) {
  const scrolled = useScrolled(36);
  const compacto = !colapsable || scrolled;

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 pt-[env(safe-area-inset-top)] transition-colors duration-200',
          compacto ? 'border-b border-line bg-bg/85 backdrop-blur-xl' : 'border-b border-transparent bg-bg'
        )}>
        
        <div className="flex h-12 items-center gap-1 px-2">
          {onVolver ?
          <IconButton aria-label="Volver" onClick={onVolver}>
              <ChevronLeftIcon size={22} />
            </IconButton> :

          <span className="pl-2">
              <Logo compacto />
            </span>
          }
          {colapsable ?
          <motion.span
            initial={false}
            animate={{ opacity: compacto ? 1 : 0, y: compacto ? 0 : 4 }}
            transition={{ duration: 0.18 }}
            className="flex-1 truncate px-2 text-[15px] font-semibold"
            aria-hidden={!compacto}>
            
              {titulo}
            </motion.span> :

          <h1 className="flex-1 truncate px-2 text-[15px] font-semibold">{titulo}</h1>
          }
          <div className="flex items-center">{acciones}</div>
        </div>
      </header>
      {colapsable &&
      <div className="px-4 pb-4 pt-1">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{titulo}</h1>
          {subtitulo && <div className="mt-1 text-sm text-muted">{subtitulo}</div>}
        </div>
      }
    </>);

}