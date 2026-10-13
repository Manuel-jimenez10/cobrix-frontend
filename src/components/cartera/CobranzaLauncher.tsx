import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SparklesIcon, TriangleAlertIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useCobranza } from '../../contexts/CobranzaContext';
import { useUI } from '../../contexts/UIContext';
import type { ProgresoCobranza } from '../../types/cobranza';
import { AgentAvatar } from '../ui/AgentAvatar';
import { Button } from '../ui/Button';
import { Money } from '../ui/Money';
import { ResponsiveDialog } from '../ui/ResponsiveDialog';
import { SuccessCheck } from '../ui/SuccessCheck';
import { CobranzaProgreso } from './CobranzaProgreso';

type Fase = 'confirmar' | 'ejecutando' | 'listo' | 'error';

/** Flujo global "Iniciar cobranza con IA": confirmación → secuencia visible de agentes → resultado. */
export function CobranzaLauncher() {
  const { cobranza, cerrarCobranza } = useUI();
  const { clientes, iniciar, canal } = useCobranza();
  const navigate = useNavigate();
  const [fase, setFase] = useState<Fase>('confirmar');
  const [progreso, setProgreso] = useState<ProgresoCobranza | null>(null);
  const [enviados, setEnviados] = useState(0);

  useEffect(() => {
    if (cobranza.abierta) {
      setFase('confirmar');
      setProgreso(null);
    }
  }, [cobranza.abierta]);

  const { incluidos, omitidos } = useMemo(() => {
    const base = cobranza.clienteIds ? clientes.filter((c) => cobranza.clienteIds?.includes(c.id)) : clientes.filter((c) => c.estado === 'vencido');
    return {
      incluidos: base.filter((c) => c.deuda > 0 && !c.escalado).sort((a, b) => b.prioridad.score - a.prioridad.score),
      omitidos: base.filter((c) => c.escalado)
    };
  }, [cobranza.clienteIds, clientes]);

  const total = incluidos.reduce((s, c) => s + c.deuda, 0);

  const ejecutar = async () => {
    setFase('ejecutando');
    try {
      const r = await iniciar(
        incluidos.map((c) => c.id),
        { onProgreso: setProgreso }
      );
      setEnviados(r.enviados);
      setFase('listo');
      toast.success(`${r.enviados} ${r.enviados === 1 ? 'mensaje enviado' : 'mensajes enviados'}`, {
        description: 'El Negociador responderá en cuanto contesten.'
      });
    } catch {
      setFase('error');
    }
  };

  const unico = incluidos.length === 1 ? incluidos[0] : null;

  return (
    <ResponsiveDialog
      abierto={cobranza.abierta}
      onCerrar={fase === 'ejecutando' ? undefined : cerrarCobranza}
      titulo={fase === 'listo' ? 'Cobranza en marcha' : 'Cobranza con IA'}
      descripcion={fase === 'confirmar' ? 'Revisa antes de enviar. Nada sale sin tu confirmación.' : undefined}>
      
      <AnimatePresence mode="wait" initial={false}>
        {fase === 'confirmar' &&
        <motion.div key="confirmar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-5">
            {incluidos.length === 0 ?
          <p className="rounded-xl border border-line bg-bg/40 p-4 text-sm text-muted">
                No hay clientes con saldo vencido para contactar{omitidos.length ? ': los seleccionados están escalados a humano.' : '.'}
              </p> :

          <>
                <div className="rounded-xl border border-line bg-bg/40 p-4">
                  <p className="text-sm text-muted">{unico ? unico.empresa : `${incluidos.length} clientes por contactar`}</p>
                  <Money valor={total} moneda className="mt-1 block text-[28px] font-semibold" />
                </div>
                <ol className="space-y-3">
                  {[
              { agente: 'analista' as const, texto: 'El Analista ordena la cola por prioridad.' },
              { agente: 'redactor' as const, texto: 'El Redactor escribe cada mensaje: amable, firme o final según el intento.' },
              { agente: 'negociador' as const, texto: `Se envían por ${canal === 'whatsapp' ? 'WhatsApp' : 'el simulador'} y el Negociador atiende las respuestas.` }].
              map((p) =>
              <li key={p.agente} className="flex items-center gap-3 text-sm">
                      <AgentAvatar agente={p.agente} tamano="sm" />
                      <span className="text-muted">{p.texto}</span>
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
            {omitidos.length > 0 &&
          <p className="flex items-start gap-2 text-xs text-muted">
                <TriangleAlertIcon size={14} className="mt-px shrink-0 text-warn" aria-hidden="true" />
                {omitidos.length === 1 ? `${omitidos[0].empresa} está escalado a humano y no recibirá mensajes.` : `${omitidos.length} clientes escalados a humano no recibirán mensajes.`}
              </p>
          }
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variante="fantasma" onClick={cerrarCobranza}>
                Cancelar
              </Button>
              <Button variante="primario" icono={SparklesIcon} onClick={ejecutar} disabled={incluidos.length === 0}>
                Iniciar cobranza
              </Button>
            </div>
          </motion.div>
        }

        {(fase === 'ejecutando' || fase === 'listo') &&
        <motion.div key="progreso" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-5">
            {fase === 'listo' &&
          <div className="flex items-center gap-3">
                <SuccessCheck />
                <div>
                  <p className="font-medium">
                    {enviados} {enviados === 1 ? 'mensaje enviado' : 'mensajes enviados'}
                  </p>
                  <p className="text-sm text-muted">Verás las respuestas en Agentes en vivo.</p>
                </div>
              </div>
          }
            <CobranzaProgreso progreso={progreso} canal={canal} />
            {fase === 'listo' &&
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
              variante="secundario"
              onClick={() => {
                cerrarCobranza();
                navigate(unico ? `/cartera/${unico.id}` : '/cartera');
              }}>
              
                  {unico ? 'Ver conversación' : 'Ver cartera'}
                </Button>
                <Button variante="primario" onClick={cerrarCobranza}>
                  Listo
                </Button>
              </div>
          }
          </motion.div>
        }

        {fase === 'error' &&
        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <p className="text-sm text-muted">No pudimos completar el envío. Revisa la conexión con WhatsApp en Ajustes e inténtalo de nuevo.</p>
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