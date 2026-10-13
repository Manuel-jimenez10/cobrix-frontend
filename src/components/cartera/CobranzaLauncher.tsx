import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { InfoIcon, SendIcon, SmartphoneIcon, SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useCobranza } from '../../contexts/CobranzaContext';
import { useUI } from '../../contexts/UIContext';
import type { Borrador, ProgresoCobranza } from '../../types/cobranza';
import { Button } from '../ui/Button';
import { Money } from '../ui/Money';
import { ResponsiveDialog } from '../ui/ResponsiveDialog';
import { SuccessCheck } from '../ui/SuccessCheck';
import { ColaEnvio } from './ColaEnvio';
import { CobranzaProgreso } from './CobranzaProgreso';

type Fase = 'confirmar' | 'preparando' | 'cola' | 'listo' | 'error';

/**
 * Flujo global "Iniciar cobranza": confirmación → se ordena por prioridad → la IA redacta
 * cada mensaje → la persona los revisa y los envía uno a uno desde su WhatsApp → resultado.
 */
export function CobranzaLauncher() {
  const { cobranza, cerrarCobranza } = useUI();
  const { clientes, preparar, canal, telefonoPrueba, iaActiva, refrescarSilencioso } = useCobranza();
  const navigate = useNavigate();
  const [fase, setFase] = useState<Fase>('confirmar');
  const [progreso, setProgreso] = useState<ProgresoCobranza | null>(null);
  const [borradores, setBorradores] = useState<Borrador[]>([]);
  const [resultado, setResultado] = useState({ enviados: 0, saltados: 0 });

  useEffect(() => {
    if (cobranza.abierta) {
      setFase('confirmar');
      setProgreso(null);
      setBorradores([]);
    }
  }, [cobranza.abierta]);

  const { incluidos, omitidos } = useMemo(() => {
    const base = cobranza.clienteIds ? clientes.filter((c) => cobranza.clienteIds?.includes(c.id)) : clientes.filter((c) => c.estado === 'vencido');
    const motivo = (c: (typeof base)[number]) =>
    c.deuda <= 0 ? 'sin saldo' : c.requiereAtencion ? 'espera tu respuesta' : c.escalado ? 'en revisión' : c.estado === 'promesa' ? 'tiene promesa de pago' : null;
    return {
      incluidos: base.filter((c) => !motivo(c)).sort((a, b) => b.prioridad.score - a.prioridad.score),
      omitidos: base.filter((c) => motivo(c)).map((c) => ({ empresa: c.empresa, motivo: motivo(c)! }))
    };
  }, [cobranza.clienteIds, clientes]);

  const total = incluidos.reduce((s, c) => s + c.deuda, 0);

  const ejecutar = async () => {
    setFase('preparando');
    try {
      const r = await preparar(
        incluidos.map((c) => c.id),
        { onProgreso: setProgreso, conIA: iaActiva }
      );
      setBorradores(r.borradores);
      if (r.omitidos?.length) toast(`${r.omitidos.length} omitido(s)`, { description: r.omitidos.map((o) => `${o.empresa}: ${o.motivo}`).join(' · ') });
      // Un instante para ver los pasos completos antes de pasar a la cola.
      setTimeout(() => setFase(r.borradores.length ? 'cola' : 'listo'), 450);
    } catch {
      setFase('error');
    }
  };

  const terminar = (r: {enviados: number;saltados: number;}) => {
    setResultado(r);
    setFase('listo');
    void refrescarSilencioso();
    if (r.enviados) toast.success(`${r.enviados} ${r.enviados === 1 ? 'recordatorio enviado' : 'recordatorios enviados'}`, { description: 'Cuando te respondan, pega su respuesta en la conversación del cliente.' });
  };

  const unico = incluidos.length === 1 ? incluidos[0] : null;

  return (
    <ResponsiveDialog
      abierto={cobranza.abierta}
      onCerrar={fase === 'preparando' ? undefined : cerrarCobranza}
      titulo={fase === 'listo' ? 'Listo' : fase === 'cola' ? 'Revisa y envía' : 'Enviar recordatorios'}
      descripcion={fase === 'confirmar' ? 'Cobrix prepara cada mensaje y tú lo envías desde tu WhatsApp. Nada sale sin que lo revises.' : undefined}>
      
      <AnimatePresence mode="wait" initial={false}>
        {fase === 'confirmar' &&
        <motion.div key="confirmar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-5">
            {incluidos.length === 0 ?
          <p className="rounded-xl border border-line bg-bg/40 p-4 text-sm text-muted">
                {omitidos.length ? 'Nadie de la selección necesita recordatorio ahora.' : 'No hay clientes con saldo vencido para contactar.'}
              </p> :

          <>
                <div className="rounded-xl border border-line bg-bg/40 p-4">
                  <p className="text-sm text-muted">{unico ? unico.empresa : `${incluidos.length} clientes por contactar`}</p>
                  <Money valor={total} moneda className="mt-1 block text-[28px] font-semibold" />
                </div>
                <ol className="space-y-3">
                  {[
              'Se ordenan por prioridad: primero quien más debe y más atraso tiene.',
              iaActiva ?
              'La IA redacta el mensaje de cada uno según su tono (amable, firme o final), su atraso y su historial.' :
              'Se prepara el mensaje que toca a cada uno: amable, firme o aviso final.',
              canal === 'whatsapp' ?
              'Revisas cada mensaje y lo envías desde tu WhatsApp con un toque.' :
              'Revisas cada mensaje y lo registras (modo simulador: no se abre WhatsApp).'].
              map((t, i) =>
              <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold tabular-nums text-muted">{i + 1}</span>
                      <span className="text-muted">{t}</span>
                    </li>
              )}
                </ol>
                {!unico &&
            <ul className="divide-y divide-line rounded-xl border border-line text-sm">
                    {incluidos.slice(0, 5).map((c) =>
              <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2">
                        <span className="truncate">{c.empresa}</span>
                        <Money valor={c.deuda} className="text-muted" />
                      </li>
              )}
                    {incluidos.length > 5 && <li className="px-3 py-2 text-muted">y {incluidos.length - 5} más</li>}
                  </ul>
            }
              </>
          }
            {incluidos.length > 0 && canal === 'whatsapp' && !telefonoPrueba &&
          <div className="flex items-start gap-2 rounded-xl border border-line bg-bg/40 px-3 py-2.5 text-xs text-muted">
                <SmartphoneIcon size={14} className="mt-px shrink-0 text-brand" aria-hidden="true" />
                <p>
                  ¿Pruebas con los clientes de ejemplo? Sus números son ficticios: agrega{' '}
                  <Link to="/ajustes#whatsapp" onClick={cerrarCobranza} className="font-medium text-fg underline underline-offset-2">
                    tu WhatsApp para pruebas
                  </Link>{' '}
                  y los mensajes te llegarán a ti.
                </p>
              </div>
          }
            {omitidos.length > 0 &&
          <div className="flex items-start gap-2 text-xs text-muted">
                <InfoIcon size={14} className="mt-px shrink-0 text-promise" aria-hidden="true" />
                <p>
                  No recibirán recordatorio:{' '}
                  {omitidos.slice(0, 3).map((o, i) =>
              <span key={o.empresa}>
                      {i > 0 && ', '}
                      <span className="text-fg">{o.empresa}</span> ({o.motivo})
                    </span>
              )}
                  {omitidos.length > 3 && ` y ${omitidos.length - 3} más`}.
                </p>
              </div>
          }
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variante="fantasma" onClick={cerrarCobranza}>
                Cancelar
              </Button>
              <Button variante="primario" icono={iaActiva ? SparklesIcon : SendIcon} onClick={ejecutar} disabled={incluidos.length === 0} data-tour="confirmar-envio">
                Preparar {incluidos.length > 1 ? `${incluidos.length} mensajes` : 'mensaje'}
              </Button>
            </div>
          </motion.div>
        }

        {fase === 'preparando' &&
        <motion.div key="preparando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <CobranzaProgreso progreso={progreso} conIA={iaActiva} />
          </motion.div>
        }

        {fase === 'cola' &&
        <motion.div key="cola" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <ColaEnvio borradores={borradores} onTerminar={terminar} />
          </motion.div>
        }

        {fase === 'listo' &&
        <motion.div key="listo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-5">
            <div className="flex items-center gap-3">
              <SuccessCheck />
              <div>
                <p className="font-medium">
                  {borradores.length === 0 ?
                'Nadie necesita recordatorio ahora' :
                `${resultado.enviados} ${resultado.enviados === 1 ? 'recordatorio enviado' : 'recordatorios enviados'}`}
                </p>
                <p className="text-sm text-muted">
                  {resultado.saltados > 0 ? `${resultado.saltados} saltado(s). ` : ''}
                  Cuando te respondan por WhatsApp, pega la respuesta en la conversación del cliente.
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
              variante="secundario"
              onClick={() => {
                cerrarCobranza();
                navigate(unico ? `/cartera/${unico.id}` : '/cartera');
              }}>

                {unico ? 'Ver conversación' : 'Ver cartera'}
              </Button>
              <Button variante="primario" onClick={cerrarCobranza} data-tour="cobranza-listo">
                Listo
              </Button>
            </div>
          </motion.div>
        }

        {fase === 'error' &&
        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <p className="text-sm text-muted">No pudimos preparar los mensajes. Revisa tu conexión e inténtalo de nuevo.</p>
            <div className="flex justify-end gap-2">
              <Button variante="fantasma" onClick={cerrarCobranza}>
                Cerrar
              </Button>
              <Button variante="primario" onClick={ejecutar}>
                Reintentar
              </Button>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </ResponsiveDialog>);

}