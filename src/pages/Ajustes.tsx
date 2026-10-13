import React, { Fragment, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BotIcon, DatabaseIcon, GraduationCapIcon, LogOutIcon, MessageCircleIcon, MonitorSmartphoneIcon, MoonIcon, PhoneIcon, SunIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PoliticasForm } from '../components/ajustes/PoliticasForm';
import { WhatsAppEnvio } from '../components/ajustes/WhatsAppEnvio';
import { MessageBubble } from '../components/cliente/MessageBubble';
import { MobileHeader } from '../components/layout/MobileHeader';
import { Button } from '../components/ui/Button';
import { ToneBadge } from '../components/ui/ToneBadge';
import { useAuth } from '../contexts/AuthContext';
import { useTutorial } from '../contexts/TutorialContext';
import { useCobranza } from '../contexts/CobranzaContext';
import { useUI } from '../contexts/UIContext';
import { ejemploVariables, plantillas } from '../data/plantillas';
import { useEsEscritorio } from '../hooks/useMediaQuery';
import * as api from '../services/api';
import type { Ajustes as AjustesTipo, Canal, Tono } from '../types/cobranza';
import { cn } from '../utils/cn';
import { llenarPlantilla } from '../utils/cobranza';
import { usaDatosMock } from '../utils/env';
import { EASE_OUT } from '../utils/motion';

const CANALES: {valor: Canal;etiqueta: string;descripcion: string;icono: typeof MessageCircleIcon;}[] = [
{ valor: 'whatsapp', etiqueta: 'WhatsApp', descripcion: 'Cobrix abre tu WhatsApp con el mensaje listo y tú lo envías al cliente.', icono: MessageCircleIcon },
{ valor: 'simulador', etiqueta: 'Simulador', descripcion: 'Modo demo: no se abre WhatsApp; los envíos solo se registran en Cobrix.', icono: MonitorSmartphoneIcon }];


function Seccion({ titulo, descripcion, children, id }: {titulo: string;descripcion?: string;children: React.ReactNode;id?: string;}) {
  return (
    <section id={id} data-tour={id} className="scroll-mt-20 grid grid-cols-1 gap-4 border-b border-line py-7 last:border-b-0 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 className="text-sm font-semibold">{titulo}</h2>
        {descripcion && <p className="mt-1 text-sm leading-relaxed text-muted">{descripcion}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>);

}

function ContenidoConVariables({ texto }: {texto: string;}) {
  return (
    <>
      {texto.split(/(\{\{\w+\}\})/g).map((parte, i) =>
      /^\{\{\w+\}\}$/.test(parte) ?
      <span key={i} className="rounded bg-redactor/15 px-1 font-mono text-[12px] text-redactor">
            {parte}
          </span> :

      <Fragment key={i}>{parte}</Fragment>

      )}
    </>);

}

export function Ajustes() {
  const escritorio = useEsEscritorio();
  const { hash } = useLocation();

  // Enlaces directos (p. ej. desde la Guía): /ajustes#reglas, /ajustes#whatsapp
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    return () => clearTimeout(t);
  }, [hash]);
  const navigate = useNavigate();
  const { canal, cambiarCanal, cargarEjemplo, vaciar, clientes, setTelefonoPrueba } = useCobranza();
  const { tema, alternarTema } = useUI();
  const [ajustes, setAjustes] = useState<AjustesTipo | null>(null);
  const [tono, setTono] = useState<Tono>('amable');
  const [procesandoDatos, setProcesandoDatos] = useState(false);
  const { perfil, salir } = useAuth();
  const tutorial = useTutorial();
  const [telefono, setTelefono] = useState('');
  const [guardandoTel, setGuardandoTel] = useState(false);

  useEffect(() => {
    void api.getAjustes().then((a) => {
      setAjustes(a);
      setTelefono(a.telefonoPrueba ?? '');
    });
  }, []);

  const guardarTelefono = async () => {
    setGuardandoTel(true);
    try {
      const valor = telefono.trim() || null;
      await api.actualizarTelefonoPrueba(valor);
      setTelefonoPrueba(valor);
      setAjustes((a) => a ? { ...a, telefonoPrueba: valor } : a);
      toast.success(valor ? 'Número de prueba guardado' : 'Número de prueba eliminado', {
        description: valor ? 'WhatsApp se abrirá con este número en lugar del de cada cliente.' : 'WhatsApp se abrirá con el número de cada cliente.'
      });
    } catch (e) {
      toast.error('No se pudo guardar', { description: (e as Error).message });
    } finally {
      setGuardandoTel(false);
    }
  };

  const plantilla = plantillas.find((p) => p.tono === tono) ?? plantillas[0];

  const elegirCanal = async (c: Canal) => {
    if (c === canal) return;
    await cambiarCanal(c);
    toast.success(c === 'whatsapp' ? 'Canal activo: WhatsApp' : 'Canal activo: Simulador');
  };

  const datos = async (accion: 'cargar' | 'vaciar') => {
    setProcesandoDatos(true);
    try {
      if (accion === 'cargar') {
        await cargarEjemplo();
        toast.success('Datos de ejemplo cargados');
      } else {
        await vaciar();
        toast.success('Cartera vaciada');
      }
    } finally {
      setProcesandoDatos(false);
    }
  };

  const contenido =
  <div>
      {!usaDatosMock && perfil &&
    <Seccion titulo="Cuenta" descripcion="Cada cuenta tiene su propia cartera, aislada con RLS en Supabase.">
          <div className="flex flex-col gap-4 rounded-xl border border-line p-4 sm:flex-row sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold uppercase" aria-hidden="true">
              {perfil.nombre.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {perfil.nombre}
                {perfil.esAnonimo && <span className="ml-2 rounded-md bg-promise/10 px-1.5 py-0.5 text-[11px] font-medium text-promise">Demo</span>}
              </p>
              <p className="truncate text-xs text-muted">{perfil.empresa}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                <BotIcon size={13} aria-hidden="true" />
                {perfil.iaActiva ? `Asistente y Guía con IA · ${perfil.modelo}` : 'Asistente con plantillas y reglas (sin API key de IA)'}
              </p>
            </div>
            <Button variante="secundario" icono={LogOutIcon} onClick={() => void salir()}>
              Cerrar sesión
            </Button>
          </div>
        </Seccion>
    }
      <Seccion titulo="Canal activo" descripcion="Cómo salen los recordatorios y tus respuestas.">
        <div role="radiogroup" aria-label="Canal activo" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CANALES.map((c) => {
          const activo = canal === c.valor;
          return (
            <motion.button
              key={c.valor}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => void elegirCanal(c.valor)}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className={cn('relative flex items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-150', activo ? 'border-brand/60 bg-brand/[0.06]' : 'border-line hover:border-muted/40')}>
              
                <c.icono size={18} className={cn('mt-0.5 shrink-0', activo ? 'text-brand' : 'text-muted')} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{c.etiqueta}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">{c.descripcion}</span>
                </span>
                <span className={cn('mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border', activo ? 'border-brand' : 'border-line')} aria-hidden="true">
                  {activo && <motion.span layoutId="canal-activo" className="h-2 w-2 rounded-full bg-brand" transition={{ duration: 0.18, ease: EASE_OUT }} />}
                </span>
              </motion.button>);

        })}
        </div>
      </Seccion>

      <Seccion id="reglas" titulo="Reglas de cobranza" descripcion="Cuándo se pueden preparar recordatorios y qué tan firmes pueden ser.">
        <PoliticasForm />
      </Seccion>

      <Seccion id="whatsapp" titulo="WhatsApp" descripcion="Cómo salen tus mensajes hoy y la conexión oficial con Meta que viene en camino.">
        <div className="space-y-4">
          <WhatsAppEnvio />
          <div className="rounded-xl border border-line p-4" data-tour="telefono-pruebas">
            <label htmlFor="tel-prueba" className="flex items-center gap-2 text-sm font-medium">
              <PhoneIcon size={14} className="text-muted" aria-hidden="true" />
              Tu WhatsApp para pruebas
            </label>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Los clientes de ejemplo tienen números ficticios. Si escribes aquí tu número, WhatsApp se abrirá con tu chat en lugar del de cada cliente: así ves exactamente lo que recibirían. Déjalo vacío para cobrar a clientes reales.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                id="tel-prueba"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+52 55 1234 5678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-3.5 text-[15px] tabular-nums outline-none transition-colors placeholder:text-muted/70 focus:border-brand/70 focus:ring-2 focus:ring-brand/20 lg:h-9 lg:text-sm" />

              <Button variante="secundario" onClick={() => void guardarTelefono()} disabled={guardandoTel || telefono.trim() === (ajustes?.telefonoPrueba ?? '')}>
                {guardandoTel ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Plantillas de mensaje" descripcion="La base de cada intento: amable, luego firme y al final el aviso final. Con IA, el asistente las personaliza para cada cliente; tú siempre revisas antes de enviar.">
        <div role="tablist" aria-label="Plantillas" className="mb-4 inline-flex rounded-lg border border-line p-1">
          {plantillas.map((p) =>
        <button
          key={p.tono}
          role="tab"
          type="button"
          aria-selected={tono === p.tono}
          onClick={() => setTono(p.tono)}
          className={cn('relative h-9 rounded-md px-3.5 text-sm font-medium transition-colors duration-150 lg:h-8', tono === p.tono ? 'text-fg' : 'text-muted hover:text-fg')}>
          
              {tono === p.tono && <motion.span layoutId="tab-plantilla" className="absolute inset-0 rounded-md bg-surface-2" transition={{ duration: 0.18, ease: EASE_OUT }} />}
              <span className="relative capitalize">{p.tono}</span>
            </button>
        )}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-line p-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{plantilla.nombre}</p>
              <ToneBadge tono={plantilla.tono} />
            </div>
            <p className="mt-1 text-xs text-muted">{plantilla.descripcion}</p>
            <p className="mt-3 text-sm leading-relaxed">
              <ContenidoConVariables texto={plantilla.contenido} />
            </p>
          </div>
          <div className="rounded-xl border border-line bg-bg/60 p-4">
            <p className="mb-3 text-xs text-muted">Vista previa</p>
            <MessageBubble
            key={plantilla.tono}
            mensaje={{ rol: 'agente', agente: 'redactor', tono: plantilla.tono, esPlantilla: true, contenido: llenarPlantilla(plantilla.contenido, ejemploVariables), fecha: new Date().toISOString() }} />
          
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Recorrido guiado" descripcion="Vuelve a ver el paso a paso. Si tienes dudas puntuales, pregúntale a la Guía.">
        <Button variante="secundario" icono={GraduationCapIcon} onClick={tutorial.reiniciar}>
          {tutorial.terminado ? 'Repetir recorrido' : 'Ver recorrido'}
        </Button>
      </Seccion>

      <Seccion titulo="Apariencia">
        <Button variante="secundario" icono={tema === 'oscuro' ? SunIcon : MoonIcon} onClick={alternarTema}>
          {tema === 'oscuro' ? 'Usar modo claro' : 'Usar modo oscuro'}
        </Button>
      </Seccion>

      <Seccion titulo="Datos de demostración" descripcion="Reinicia la cartera de ejemplo o vacíala para ver el estado inicial.">
        <div className="flex flex-wrap gap-2">
          <Button variante="secundario" icono={DatabaseIcon} onClick={() => void datos('cargar')} disabled={procesandoDatos}>
            {clientes.length ? 'Restablecer datos de ejemplo' : 'Cargar datos de ejemplo'}
          </Button>
          <Button variante="peligro" icono={Trash2Icon} onClick={() => void datos('vaciar')} disabled={procesandoDatos || clientes.length === 0}>
            Vaciar cartera
          </Button>
        </div>
      </Seccion>
    </div>;


  if (escritorio) {
    return (
      <div className="px-8 py-8 xl:px-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-[28px] font-semibold tracking-tight">Ajustes</h1>
          {contenido}
        </div>
      </div>);

  }

  return (
    <div className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      <MobileHeader titulo="Ajustes" onVolver={() => navigate(-1)} />
      <div className="px-4">{contenido}</div>
    </div>);

}