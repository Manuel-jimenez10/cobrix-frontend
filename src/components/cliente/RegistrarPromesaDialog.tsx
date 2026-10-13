import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import * as api from '../../services/api';
import { avisarTutorial } from '../../utils/tutorial';
import type { ClienteResumen } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { formatFecha, formatMXN } from '../../utils/format';
import { Button } from '../ui/Button';
import { ResponsiveDialog } from '../ui/ResponsiveDialog';
import { SuccessCheck } from '../ui/SuccessCheck';

interface RegistrarPromesaDialogProps {
  cliente: ClienteResumen | null;
  onCerrar: () => void;
  onRegistrada: () => void;
}

const aISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const enDias = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return aISO(d);
};
const proximoViernes = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  return aISO(d);
};

/** El equipo registra el compromiso de pago que acordó con el cliente. */
export function RegistrarPromesaDialog({ cliente, onCerrar, onRegistrada }: RegistrarPromesaDialogProps) {
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(enDias(7));
  const [fase, setFase] = useState<'form' | 'guardando' | 'exito'>('form');
  const idMonto = useId();
  const idFecha = useId();

  useEffect(() => {
    if (cliente) {
      setMonto(String(cliente.deuda));
      setFecha(enDias(7));
      setFase('form');
    }
  }, [cliente]);

  const valor = Number(monto.replace(/[^\d.]/g, ''));
  const valido = cliente !== null && valor > 0 && valor <= cliente.deuda + 0.01 && fecha >= aISO(new Date());
  const atajos = [
  { etiqueta: 'Hoy', valor: enDias(0) },
  { etiqueta: 'Viernes', valor: proximoViernes() },
  { etiqueta: '+7 días', valor: enDias(7) },
  { etiqueta: '+15 días', valor: enDias(15) }];


  const guardar = async () => {
    if (!cliente || !valido) return;
    setFase('guardando');
    try {
      const p = await api.registrarPromesa(cliente.id, { monto: valor, fecha });
      setFase('exito');
      toast.success('Promesa registrada', { description: `${formatMXN(p.monto)} · ${formatFecha(p.fechaCompromiso)}` });
      onRegistrada();
      avisarTutorial('promesa');
      setTimeout(onCerrar, 900);
    } catch (e) {
      setFase('form');
      toast.error('No se pudo registrar la promesa', { description: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <ResponsiveDialog
      abierto={Boolean(cliente)}
      onCerrar={fase === 'guardando' ? undefined : onCerrar}
      titulo="Registrar promesa de pago"
      descripcion={cliente ? `${cliente.empresa} · saldo ${formatMXN(cliente.deuda)}` : undefined}>

      <AnimatePresence mode="wait" initial={false}>
        {fase === 'exito' ?
        <motion.div key="exito" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6 text-center">
            <SuccessCheck tamano={56} />
            <p className="mt-4 font-medium">Promesa registrada</p>
            <p className="mt-1 text-sm text-muted">Los recordatorios se pausan hasta la fecha acordada.</p>
          </motion.div> :

        <motion.form
          key="form"
          data-tour="form-promesa"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void guardar();
          }}>

            <div>
              <label htmlFor={idMonto} className="text-sm font-medium">
                Monto comprometido
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">$</span>
                <input
                id={idMonto}
                inputMode="decimal"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-bg pl-7 pr-16 text-[15px] tabular-nums focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/25" />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">MXN</span>
              </div>
              {cliente && valor > cliente.deuda + 0.01 && <p className="mt-1 text-xs text-bad">No puede ser mayor que el saldo ({formatMXN(cliente.deuda)}).</p>}
              {cliente && valor > 0 && valor < cliente.deuda &&
            <p className="mt-1 text-xs text-muted">Pago parcial: quedarían {formatMXN(cliente.deuda - valor)} pendientes.</p>
            }
            </div>

            <div>
              <label htmlFor={idFecha} className="text-sm font-medium">
                Fecha de pago
              </label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {atajos.map((a) =>
              <button
                key={a.etiqueta}
                type="button"
                aria-pressed={fecha === a.valor}
                onClick={() => setFecha(a.valor)}
                className={cn(
                  'h-9 rounded-full border px-3 text-xs font-medium transition-colors',
                  fecha === a.valor ? 'border-fg bg-fg text-bg' : 'border-line text-muted hover:text-fg'
                )}>

                    {a.etiqueta}
                  </button>
              )}
              </div>
              <input
              id={idFecha}
              type="date"
              min={aISO(new Date())}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-line bg-bg px-3.5 text-[15px] [color-scheme:dark] focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/25" />
            </div>

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <Button variante="fantasma" onClick={onCerrar} disabled={fase === 'guardando'}>
                Cancelar
              </Button>
              <Button variante="primario" type="submit" disabled={!valido || fase === 'guardando'} data-tour="confirmar-promesa">
                {fase === 'guardando' ? 'Registrando…' : 'Registrar promesa'}
              </Button>
            </div>
          </motion.form>
        }
      </AnimatePresence>
    </ResponsiveDialog>);

}
