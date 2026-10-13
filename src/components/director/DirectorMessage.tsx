import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AGENTES } from '../../data/agentes';
import type { MensajeDirector } from '../../types/director';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { AgentAvatar } from '../ui/AgentAvatar';
import { ChartBlock } from './ChartBlock';
import { ClientesBlock } from './ClientesBlock';
import { ConfirmBlock } from './ConfirmBlock';
import { KpiBlock } from './KpiBlock';

interface DirectorMessageProps {
  mensaje: MensajeDirector;
  enCurso: boolean;
  esperando: boolean;
  bloqueado: boolean;
  onResolver: (bloqueId: string, confirmar: boolean) => void;
}

export function DirectorMessage({ mensaje, enCurso, esperando, bloqueado, onResolver }: DirectorMessageProps) {
  const reducir = useReducedMotion();

  if (mensaje.rol === 'usuario') {
    const texto = mensaje.bloques.map((b) => b.tipo === 'texto' ? b.texto : '').join(' ');
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE_OUT }} className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md border border-line bg-surface-2 px-4 py-2.5 text-[15px]">{texto}</p>
      </motion.div>);

  }

  const delegaciones = Array.from(new Set(mensaje.delegaciones ?? []));
  const ultimoIdx = mensaje.bloques.length - 1;

  return (
    <div className="flex gap-3">
      <AgentAvatar agente="director" className="mt-0.5" />
      <div className="min-w-0 flex-1 space-y-3">
        {delegaciones.length > 0 &&
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-muted">
            <span>Consultó a</span>
            {delegaciones.map((a) =>
          <span key={a} className={cn('inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-medium', AGENTES[a].texto)}>
                <AgentAvatar agente={a} tamano="sm" className="-ml-1.5 scale-75" />
                {AGENTES[a].nombre}
              </span>
          )}
          </div>
        }
        {mensaje.bloques.length === 0 && esperando &&
        <div className="flex gap-1 pt-3" aria-label="El Director está pensando">
            {[0, 1, 2].map((i) =>
          <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-muted" animate={reducir ? undefined : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
          )}
          </div>
        }
        {mensaje.bloques.map((b, i) =>
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: EASE_OUT }}>
            {b.tipo === 'texto' &&
          <p className="whitespace-pre-wrap pt-1 text-[15px] leading-relaxed">
                {b.texto}
                {enCurso && i === ultimoIdx && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-fg motion-safe:animate-pulse" aria-hidden="true" />}
              </p>
          }
            {b.tipo === 'kpi' && <KpiBlock bloque={b} />}
            {b.tipo === 'grafica' && <ChartBlock bloque={b} />}
            {b.tipo === 'clientes' && <ClientesBlock bloque={b} />}
            {b.tipo === 'confirmacion' && <ConfirmBlock bloque={b} deshabilitado={bloqueado} onResolver={(c) => onResolver(b.id, c)} />}
          </motion.div>
        )}
      </div>
    </div>);

}