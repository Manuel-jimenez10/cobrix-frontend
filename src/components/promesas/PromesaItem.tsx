import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useCobranza } from '../../contexts/CobranzaContext';
import type { PromesaConCliente } from '../../types/cobranza';
import type { GrupoPromesa } from '../../utils/cobranza';
import { cn } from '../../utils/cn';
import { formatFecha, formatMXN, relativoDias } from '../../utils/format';
import { EASE_OUT } from '../../utils/motion';
import { espera } from '../../utils/stream';
import { Button } from '../ui/Button';
import { Money } from '../ui/Money';
import { SuccessCheck } from '../ui/SuccessCheck';
import { avisarTutorial } from '../../utils/tutorial';

export function PromesaItem({ promesa: p, grupo }: {promesa: PromesaConCliente;grupo: GrupoPromesa;}) {
  const { cumplirPromesa } = useCobranza();
  const [fase, setFase] = useState<'reposo' | 'guardando' | 'exito'>('reposo');
  const cumplida = p.estado === 'cumplida';

  const marcar = async () => {
    setFase('guardando');
    try {
      setFase('exito');
      await Promise.all([cumplirPromesa(p.id), espera(650)]);
      toast.success('Promesa cumplida', { description: `${p.cliente.empresa} · ${formatMXN(p.monto)}` });
      avisarTutorial('cumplir');
    } catch {
      setFase('reposo');
      toast.error('No se pudo actualizar la promesa');
    }
  };

  return (
    <motion.li layout layoutId={`promesa-${p.id}`} transition={{ duration: 0.28, ease: EASE_OUT }} className="flex items-center gap-3 bg-surface px-4 py-3.5 lg:gap-5 lg:px-5">
      <div className="min-w-0 flex-1">
        <Link to={`/cartera/${p.clienteId}`} className="block truncate text-sm font-medium hover:underline">
          {p.cliente.empresa}
        </Link>
        <p className="mt-0.5 truncate text-xs text-muted">
          <span className="font-mono">{p.folio}</span> · {p.cliente.nombre}
        </p>
      </div>
      <div className="hidden w-32 text-sm sm:block">
        <p className="tabular-nums">{formatFecha(p.fechaCompromiso)}</p>
        <p className={cn('text-xs', grupo === 'vencidas' ? 'text-bad' : grupo === 'hoy' ? 'text-warn' : 'text-muted')}>{relativoDias(p.fechaCompromiso)}</p>
      </div>
      <div className="text-right">
        <Money valor={p.monto} className={cn('text-[15px] font-semibold', cumplida && 'text-muted')} />
        <p className={cn('text-xs sm:hidden', grupo === 'vencidas' ? 'text-bad' : 'text-muted')}>{relativoDias(p.fechaCompromiso)}</p>
      </div>
      <div className="flex w-11 justify-end sm:w-32">
        {cumplida ?
        <span className="inline-flex items-center gap-1 text-xs font-medium text-ok">
            <CheckIcon size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Cumplida</span>
          </span> :
        fase === 'exito' ?
        <SuccessCheck tamano={32} /> :

        <Button data-tour="cumplir-promesa" variante="secundario" tamano="sm" icono={CheckIcon} onClick={marcar} disabled={fase !== 'reposo'} aria-label={`Marcar como cumplida la promesa de ${p.cliente.empresa}`} className="w-11 px-0 sm:w-auto sm:px-3">
            <span className="hidden sm:inline">Cumplida</span>
          </Button>
        }
      </div>
    </motion.li>);

}