import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2Icon,
  CheckIcon,
  CircleAlertIcon,
  ClockIcon,
  CopyIcon,
  MessageCircleIcon,
  MessageSquareTextIcon,
  PhoneCallIcon,
  RefreshCwIcon,
  SendIcon,
  SmartphoneIcon,
  TriangleAlertIcon,
  UnplugIcon } from
'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useCobranza } from '../../contexts/CobranzaContext';
import * as api from '../../services/api';
import type { EstadoPlantilla, EstadoWhatsApp, MetodoCodigo } from '../../types/whatsapp';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

const PAISES = [
{ cc: '52', nombre: 'México', bandera: '🇲🇽' },
{ cc: '58', nombre: 'Venezuela', bandera: '🇻🇪' },
{ cc: '57', nombre: 'Colombia', bandera: '🇨🇴' },
{ cc: '51', nombre: 'Perú', bandera: '🇵🇪' },
{ cc: '56', nombre: 'Chile', bandera: '🇨🇱' },
{ cc: '54', nombre: 'Argentina', bandera: '🇦🇷' },
{ cc: '34', nombre: 'España', bandera: '🇪🇸' },
{ cc: '1', nombre: 'EE. UU.', bandera: '🇺🇸' }];


const NOMBRE_PLANTILLA: Record<string, string> = { amable: 'Recordatorio amable', firme: 'Seguimiento firme', final: 'Aviso final' };

const ESTADO_PLANTILLA: Record<EstadoPlantilla, {texto: string;clase: string;}> = {
  APPROVED: { texto: 'Aprobada', clase: 'bg-ok/15 text-ok' },
  PENDING: { texto: 'En revisión', clase: 'bg-warn/15 text-warn' },
  REJECTED: { texto: 'Rechazada', clase: 'bg-bad/15 text-bad' },
  PAUSED: { texto: 'Pausada', clase: 'bg-bad/15 text-bad' },
  DISABLED: { texto: 'Deshabilitada', clase: 'bg-bad/15 text-bad' },
  NO_CREADA: { texto: 'Sin crear', clase: 'bg-surface-2 text-muted' }
};

const CALIDAD: Record<string, {texto: string;clase: string;}> = {
  GREEN: { texto: 'Alta', clase: 'text-ok' },
  YELLOW: { texto: 'Media', clase: 'text-warn' },
  RED: { texto: 'Baja', clase: 'text-bad' }
};

const claseInput =
'h-11 w-full rounded-lg border border-line bg-surface-2 px-3.5 text-[15px] outline-none transition-colors placeholder:text-muted/70 focus:border-brand/70 focus:ring-2 focus:ring-brand/20 lg:h-10 lg:text-sm';

function Pasos({ actual }: {actual: 1 | 2 | 3;}) {
  const pasos = ['Tu número', 'Código', 'Conectado'];
  return (
    <ol className="flex items-center gap-2" aria-label="Pasos para conectar WhatsApp">
      {pasos.map((p, i) => {
        const n = i + 1;
        const hecho = n < actual;
        const activo = n === actual;
        return (
          <li key={p} className="flex items-center gap-2">
            <span className={cn('grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold transition-colors', hecho ? 'bg-brand text-on-brand' : activo ? 'border border-brand text-brand' : 'border border-line text-muted')}>
              {hecho ? <CheckIcon size={12} strokeWidth={3} /> : n}
            </span>
            <span className={cn('hidden text-xs sm:inline', activo ? 'text-fg' : 'text-muted')}>{p}</span>
            {n < pasos.length && <span className={cn('h-px w-6 sm:w-10', hecho ? 'bg-brand' : 'bg-line')} aria-hidden="true" />}
          </li>);

      })}
    </ol>);

}

/** Seis casillas para el código de verificación (pegar el código completo también funciona). */
function CodigoOtp({ valor, onChange, deshabilitado }: {valor: string;onChange: (v: string) => void;deshabilitado?: boolean;}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digitos = valor.padEnd(6, ' ').slice(0, 6).split('');
  const poner = (i: number, d: string) => {
    const arr = valor.padEnd(6, ' ').split('');
    arr[i] = d;
    onChange(arr.join('').replace(/\s+$/, '').replace(/\s/g, ''));
  };
  return (
    <div className="flex gap-2" role="group" aria-label="Código de 6 dígitos">
      {digitos.map((d, i) =>
      <input
        key={i}
        ref={(el) => {
          refs.current[i] = el;
        }}
        inputMode="numeric"
        autoComplete={i === 0 ? 'one-time-code' : 'off'}
        aria-label={`Dígito ${i + 1}`}
        maxLength={6}
        disabled={deshabilitado}
        value={d.trim()}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '');
          if (v.length > 1) {
            onChange(v.slice(0, 6));
            refs.current[Math.min(v.length, 5)]?.focus();
            return;
          }
          poner(i, v);
          if (v && i < 5) refs.current[i + 1]?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !d.trim() && i > 0) refs.current[i - 1]?.focus();
        }}
        className="h-12 w-11 rounded-xl border border-line bg-surface-2 text-center text-lg font-semibold tabular-nums outline-none transition-colors focus:border-brand/70 focus:ring-2 focus:ring-brand/20 sm:h-14 sm:w-12" />

      )}
    </div>);

}

export function WhatsAppConexion() {
  const { perfil } = useAuth();
  const { refrescarSilencioso } = useCobranza();
  const [estado, setEstado] = useState<EstadoWhatsApp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [cc, setCc] = useState('52');
  const [numero, setNumero] = useState('');
  const [nombre, setNombre] = useState(perfil?.empresa ?? '');
  const [metodo, setMetodo] = useState<MetodoCodigo>('SMS');
  const [codigo, setCodigo] = useState('');
  const [ocupado, setOcupado] = useState<null | 'conectar' | 'verificar' | 'reenviar' | 'desconectar' | 'plantillas' | 'prueba'>(null);
  const [espera, setEspera] = useState(0);
  const [telPrueba, setTelPrueba] = useState('');
  const idNumero = useId();
  const idNombre = useId();

  const cargar = async () => {
    try {
      setEstado(await api.getWhatsApp());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  // El perfil llega después del primer render: propone su empresa como nombre del negocio.
  useEffect(() => {
    if (perfil?.empresa) setNombre((n) => n || perfil.empresa);
  }, [perfil?.empresa]);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const accion = async (tipo: NonNullable<typeof ocupado>, fn: () => Promise<void>) => {
    setOcupado(tipo);
    try {
      await fn();
    } catch (e) {
      toast.error('No se pudo completar', { description: (e as Error).message });
    } finally {
      setOcupado(null);
    }
  };

  const conectar = () =>
  accion('conectar', async () => {
    setEstado(await api.conectarWhatsApp({ cc, numero, nombre, metodo }));
    setCodigo('');
    setEspera(60);
    toast.success(metodo === 'SMS' ? 'Te enviamos un SMS con el código' : 'Te vamos a llamar para dictarte el código');
  });

  const verificar = () =>
  accion('verificar', async () => {
    const r = await api.verificarCodigoWhatsApp(codigo);
    setEstado(r);
    setFormAbierto(false);
    toast.success('¡WhatsApp conectado!', { description: 'Los recordatorios saldrán desde tu número.' });
    void refrescarSilencioso();
  });

  const reenviar = (m: MetodoCodigo) =>
  accion('reenviar', async () => {
    await api.reenviarCodigoWhatsApp(m);
    setEspera(60);
    toast.success(m === 'SMS' ? 'Código reenviado por SMS' : 'Te llamaremos en unos segundos');
  });

  const desconectar = () =>
  accion('desconectar', async () => {
    await api.desconectarWhatsApp();
    await cargar();
    setFormAbierto(false);
    toast.success('WhatsApp desconectado', { description: 'Los mensajes vuelven al simulador.' });
    void refrescarSilencioso();
  });

  const plantillas = () =>
  accion('plantillas', async () => {
    setEstado(await api.sincronizarPlantillas());
    toast.success('Plantillas actualizadas');
  });

  const probar = () =>
  accion('prueba', async () => {
    await api.enviarPruebaWhatsApp(telPrueba);
    toast.success('Mensaje de prueba enviado', { description: 'Revisa el WhatsApp de ese número.' });
  });

  if (error) return <p className="text-sm text-bad">No pudimos leer el estado de WhatsApp: {error}</p>;
  if (!estado) return <Skeleton className="h-40 w-full rounded-xl" />;

  if (!estado.disponible) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-line p-4">
        <CircleAlertIcon size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-medium">Conexión de números aún no habilitada</p>
          <p className="mt-1 leading-relaxed text-muted">
            El servidor necesita la cuenta de WhatsApp Business de Cobrix (variables <span className="font-mono text-xs">WHATSAPP_TOKEN</span> y{' '}
            <span className="font-mono text-xs">WHATSAPP_WABA_ID</span>). Mientras tanto, los mensajes usan el simulador.
          </p>
        </div>
      </div>);

  }

  const paso: 1 | 2 | 3 = estado.estado === 'conectado' ? 3 : estado.estado === 'verificando' ? 2 : 1;
  const listoParaEnviar = numero.replace(/\D/g, '').length >= 8 && nombre.trim().length >= 3;

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <AnimatePresence mode="wait" initial={false}>
        {/* ── Conectado ── */}
        {estado.estado === 'conectado' &&
        <motion.div key="conectado" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
            <div className="flex items-center gap-3 border-b border-line p-4">
              <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ok/15 text-ok">
                <MessageCircleIcon size={18} aria-hidden="true" />
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-surface bg-ok" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tabular-nums">{estado.numero}</p>
                <p className="truncate text-xs text-muted">{estado.nombre}</p>
              </div>
              <span className="rounded-full bg-ok/15 px-2.5 py-1 text-xs font-medium text-ok">Conectado</span>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-line text-sm">
              <div className="bg-surface px-4 py-3">
                <dt className="text-xs text-muted">Calidad del número</dt>
                <dd className={cn('mt-0.5 font-medium', CALIDAD[estado.calidad ?? '']?.clase)}>{CALIDAD[estado.calidad ?? '']?.texto ?? 'Sin datos aún'}</dd>
              </div>
              <div className="bg-surface px-4 py-3">
                <dt className="text-xs text-muted">Nombre visible</dt>
                <dd className="mt-0.5 font-medium">{estado.estadoNombre === 'APPROVED' ? 'Aprobado' : estado.estadoNombre ? 'En revisión' : '—'}</dd>
              </div>
            </dl>

            <div className="border-t border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Plantillas de cobranza</p>
                <Button variante="fantasma" tamano="sm" icono={RefreshCwIcon} onClick={() => void plantillas()} disabled={ocupado !== null}>
                  {ocupado === 'plantillas' ? 'Actualizando…' : 'Actualizar'}
                </Button>
              </div>
              <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
                {estado.plantillas.map((p, i) =>
              <motion.li key={p.tono} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className="block">{NOMBRE_PLANTILLA[p.tono]}</span>
                      {p.motivo && <span className="block text-xs text-bad">Motivo: {p.motivo}</span>}
                    </span>
                    <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium', ESTADO_PLANTILLA[p.estado].clase)}>
                      {p.estado === 'APPROVED' ? <CheckIcon size={12} /> : p.estado === 'PENDING' ? <ClockIcon size={12} /> : null}
                      {ESTADO_PLANTILLA[p.estado].texto}
                    </span>
                  </motion.li>
              )}
              </ul>
              {estado.plantillas.some((p) => p.estado !== 'APPROVED') &&
            <p className="mt-2 text-xs leading-relaxed text-muted">Meta revisa las plantillas en minutos u horas. Mientras una esté en revisión, ese tono de recordatorio no se puede enviar.</p>
            }
            </div>

            <div className="border-t border-line p-4">
              <label htmlFor="tel-prueba-wa" className="text-sm font-medium">
                Probar envío
              </label>
              <p className="mt-0.5 text-xs text-muted">Te mandamos el recordatorio amable de ejemplo para que veas cómo le llega a tu cliente.</p>
              <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                <input id="tel-prueba-wa" type="tel" inputMode="tel" placeholder="+52 55 1234 5678" value={telPrueba} onChange={(e) => setTelPrueba(e.target.value)} className={claseInput} />
                <Button variante="secundario" icono={SendIcon} onClick={() => void probar()} disabled={ocupado !== null || telPrueba.replace(/\D/g, '').length < 8}>
                  {ocupado === 'prueba' ? 'Enviando…' : 'Enviar prueba'}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-line p-4 sm:flex-row sm:items-center sm:justify-between">
              <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(estado.webhookUrl).then(() => toast.success('URL del webhook copiada'));
              }}
              className="inline-flex min-w-0 items-center gap-1.5 text-left text-xs text-muted hover:text-fg"
              title="URL que va en Meta → WhatsApp → Configuración → Webhook">

                <CopyIcon size={12} className="shrink-0" aria-hidden="true" />
                <span className="truncate font-mono">{estado.webhookUrl}</span>
              </button>
              <Button variante="peligro" tamano="sm" icono={UnplugIcon} onClick={() => void desconectar()} disabled={ocupado !== null}>
                {ocupado === 'desconectar' ? 'Desconectando…' : 'Desconectar'}
              </Button>
            </div>
          </motion.div>
        }

        {/* ── Sin conectar: invitación ── */}
        {estado.estado === 'desconectado' && !formAbierto &&
        <motion.div key="invitar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE_OUT }} className="relative overflow-hidden p-5">
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">
                <MessageCircleIcon size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">Envía los recordatorios desde el WhatsApp de tu empresa</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">Escribe tu número, confirma el código que te llega por SMS y listo. Cobrix crea las plantillas por ti.</p>
                <Button variante="primario" className="mt-4" onClick={() => setFormAbierto(true)} data-tour="conectar-whatsapp">
                  Conectar mi WhatsApp
                </Button>
              </div>
            </div>
          </motion.div>
        }

        {/* ── Paso 1: número ── */}
        {estado.estado === 'desconectado' && formAbierto &&
        <motion.form
          key="numero"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (listoParaEnviar) void conectar();
          }}>

            <Pasos actual={paso} />
            <div>
              <label htmlFor={idNumero} className="text-sm font-medium">
                Número de WhatsApp para cobranza
              </label>
              <div className="mt-1.5 flex gap-2">
                <select aria-label="País" value={cc} onChange={(e) => setCc(e.target.value)} className={cn(claseInput, 'w-[118px] shrink-0 px-2.5')}>
                  {PAISES.map((p) =>
                <option key={p.cc} value={p.cc}>
                      {p.bandera} +{p.cc}
                    </option>
                )}
                </select>
                <input id={idNumero} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="55 1234 5678" value={numero} onChange={(e) => setNumero(e.target.value)} className={claseInput} />
              </div>
            </div>
            <div>
              <label htmlFor={idNombre} className="text-sm font-medium">
                Nombre del negocio
              </label>
              <input id={idNombre} placeholder="Distribuidora del Valle" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} className={cn(claseInput, 'mt-1.5')} />
              <p className="mt-1 text-xs text-muted">Es el nombre que verán tus clientes en WhatsApp. Meta lo revisa: usa tu nombre comercial real.</p>
            </div>
            <fieldset>
              <legend className="text-sm font-medium">¿Cómo quieres recibir el código?</legend>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(
              [
              { v: 'SMS', t: 'SMS', i: MessageSquareTextIcon },
              { v: 'VOICE', t: 'Llamada', i: PhoneCallIcon }] as
              const).
              map((o) =>
              <button
                key={o.v}
                type="button"
                aria-pressed={metodo === o.v}
                onClick={() => setMetodo(o.v)}
                className={cn('flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors', metodo === o.v ? 'border-brand/60 bg-brand/10 text-fg' : 'border-line text-muted hover:text-fg')}>

                    <o.i size={15} aria-hidden="true" /> {o.t}
                  </button>
              )}
              </div>
            </fieldset>
            <div className="flex items-start gap-2.5 rounded-lg border border-warn/30 bg-warn/[0.07] p-3 text-xs leading-relaxed">
              <TriangleAlertIcon size={14} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
              <span className="text-muted">
                <span className="font-medium text-fg">Ese número no puede estar activo en la app de WhatsApp.</span> Si lo usas en tu teléfono, borra primero esa cuenta (WhatsApp → Ajustes → Cuenta → Eliminar cuenta). Te recomendamos un número dedicado a cobranza.
              </span>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variante="fantasma" onClick={() => setFormAbierto(false)} disabled={ocupado !== null}>
                Cancelar
              </Button>
              <Button variante="primario" type="submit" icono={SmartphoneIcon} disabled={!listoParaEnviar || ocupado !== null}>
                {ocupado === 'conectar' ? 'Enviando código…' : 'Enviar código'}
              </Button>
            </div>
          </motion.form>
        }

        {/* ── Paso 2: código ── */}
        {estado.estado === 'verificando' &&
        <motion.form
          key="codigo"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="space-y-5 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (codigo.length === 6) void verificar();
          }}>

            <Pasos actual={paso} />
            <div>
              <p className="text-sm font-medium">Escribe el código de 6 dígitos</p>
              <p className="mt-0.5 text-sm text-muted">
                Lo enviamos a <span className="tabular-nums text-fg">{estado.numero}</span>.
              </p>
            </div>
            <CodigoOtp valor={codigo} onChange={setCodigo} deshabilitado={ocupado === 'verificar'} />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {espera > 0 ?
            <span className="text-muted">
                  Puedes pedir otro código en <span className="tabular-nums">{espera}</span> s
                </span> :

            <>
                  <button type="button" onClick={() => void reenviar('SMS')} disabled={ocupado !== null} className="font-medium text-brand hover:underline disabled:opacity-50">
                    Reenviar por SMS
                  </button>
                  <button type="button" onClick={() => void reenviar('VOICE')} disabled={ocupado !== null} className="font-medium text-brand hover:underline disabled:opacity-50">
                    Prefiero una llamada
                  </button>
                </>
            }
              <button type="button" onClick={() => void desconectar()} disabled={ocupado !== null} className="text-muted hover:text-fg">
                Cambiar número
              </button>
            </div>
            <div className="flex justify-end">
              <Button variante="primario" type="submit" icono={CheckCircle2Icon} disabled={codigo.length !== 6 || ocupado !== null}>
                {ocupado === 'verificar' ? 'Conectando…' : 'Verificar y conectar'}
              </Button>
            </div>
          </motion.form>
        }
      </AnimatePresence>
    </div>);

}
