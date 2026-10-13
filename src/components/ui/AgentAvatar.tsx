import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CompassIcon, HandshakeIcon, PenLineIcon, TrendingUpIcon } from 'lucide-react';
import { AGENTES } from '../../data/agentes';
import type { AgenteId } from '../../types/cobranza';
import { cn } from '../../utils/cn';

const ICONOS = {
  director: CompassIcon,
  analista: TrendingUpIcon,
  redactor: PenLineIcon,
  negociador: HandshakeIcon
};

const TAMANOS = {
  sm: { caja: 'h-6 w-6', icono: 12 },
  md: { caja: 'h-8 w-8', icono: 15 },
  lg: { caja: 'h-11 w-11', icono: 20 }
};

interface AgentAvatarProps {
  agente: AgenteId;
  tamano?: keyof typeof TAMANOS;
  activo?: boolean;
  className?: string;
}

export function AgentAvatar({ agente, tamano = 'md', activo = false, className }: AgentAvatarProps) {
  const meta = AGENTES[agente];
  const Icono = ICONOS[agente];
  const t = TAMANOS[tamano];
  const reducir = useReducedMotion();
  return (
    <span className={cn('relative inline-flex shrink-0', className)} aria-hidden="true">
      {activo && !reducir &&
      <motion.span
        className={cn('absolute inset-0 rounded-full', meta.fondo)}
        initial={{ opacity: 0.4, scale: 1 }}
        animate={{ opacity: 0, scale: 1.75 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} />

      }
      <span className={cn('relative inline-flex items-center justify-center rounded-full ring-1', meta.suave, meta.texto, meta.anillo, t.caja)}>
        <Icono size={t.icono} strokeWidth={2.2} />
      </span>
    </span>);

}