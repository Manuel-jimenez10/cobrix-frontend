import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCobranza } from '../../contexts/CobranzaContext';
import { formatMXN } from '../../utils/format';
import { Button } from '../ui/Button';
import { Money } from '../ui/Money';
import { ResponsiveDialog } from '../ui/ResponsiveDialog';
import { SuccessCheck } from '../ui/SuccessCheck';

interface ConfirmarPagoDialogProps {
  clienteId: string | null;
  onCerrar: () => void;
}

export function ConfirmarPagoDialog({ clienteId, onCerrar }: ConfirmarPagoDialogProps) {
  const { clientes, marcarPagada } = useCobranza();
  const [fase, setFase] = useState<'confirmar' | 'guardando' | 'exito'>('confirmar');
  const [cliente, setCliente] = useState(() => clientes.find((c) => c.id === clienteId) ?? null);

  useEffect(() => {
    if (clienteId) {
      setCliente(clientes.find((c) => c.id === clienteId) ?? null);
      setFase('confirmar');
    }
    // Solo al abrir: conservamos el cliente mientras se muestra el éxito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const confirmar = async () => {
    if (!cliente) return;
    setFase('guardando');
    try {
      const monto = await marcarPagada(cliente.id);
      setFase('exito');
      toast.success('Pago registrado', { description: `${cliente.empresa} · ${formatMXN(monto)}` });
      setTimeout(onCerrar, 950);
    } catch {
      setFase('confirmar');
      toast.error('No se pudo registrar el pago');
    }
  };

  return (
    <ResponsiveDialog abierto={Boolean(clienteId)} onCerrar={fase === 'guardando' ? undefined : onCerrar} titulo="Marcar como pagada">
      <AnimatePresence mode="wait" initial={false}>
        {fase === 'exito' ?
        <motion.div key="exito" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6 text-center">
            <SuccessCheck tamano={56} />
            <p className="mt-4 font-medium">Pago registrado</p>
            <p className="mt-1 text-sm text-muted">Se sumó a lo recuperado este mes.</p>
          </motion.div> :

        <motion.div key="confirmar" exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="space-y-5">
            {cliente &&
          <div className="rounded-xl border border-line bg-bg/40 p-4">
                <p className="text-sm text-muted">{cliente.empresa}</p>
                <Money valor={cliente.deuda} moneda className="mt-1 block text-[28px] font-semibold" />
                <p className="mt-1 text-sm text-muted">
                  {cliente.facturasAbiertas} {cliente.facturasAbiertas === 1 ? 'factura abierta' : 'facturas abiertas'}
                </p>
              </div>
          }
            <p className="text-sm leading-relaxed text-muted">
              Las facturas se marcarán como pagadas y los agentes dejarán de dar seguimiento a este cliente. Hazlo solo si ya confirmaste el depósito.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variante="fantasma" onClick={onCerrar} disabled={fase === 'guardando'}>
                Cancelar
              </Button>
              <Button variante="primario" onClick={confirmar} disabled={fase === 'guardando' || !cliente}>
                {fase === 'guardando' ? 'Registrando…' : 'Confirmar pago'}
              </Button>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </ResponsiveDialog>);

}