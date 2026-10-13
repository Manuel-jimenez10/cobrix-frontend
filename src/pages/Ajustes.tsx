import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BotIcon, DatabaseIcon, GraduationCapIcon, LogOutIcon, MessageCircleIcon, MonitorSmartphoneIcon, MoonIcon, PhoneIcon, RefreshCwIcon, SunIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PoliticasForm } from '../components/ajustes/PoliticasForm';
import { MessageBubble } from '../components/cliente/MessageBubble';
import { MobileHeader } from '../components/layout/MobileHeader';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
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
import { tiempoRelativo } from '../utils/format';
import { usaDatosMock } from '../utils/env';
import { EASE_OUT } from '../utils/motion';

const CANALES: {valor: Canal;etiqueta: string;descripcion: string;icono: typeof MessageCircleIcon;}[] = [
{ valor: 'whatsapp', etiqueta: 'WhatsApp', descripcion: 'Los mensajes llegan al WhatsApp real de cada cliente.', icono: MessageCircleIcon },
{ valor: 'simulador', etiqueta: 'Simulador', descripcion: 'Modo demo: tú respondes como cliente dentro de la app.', icono: MonitorSmartphoneIcon }];


function Seccion({ titulo, descripcion, children }: {titulo: string;descripcion?: string;children: React.ReactNode;}) {
  return (
    <section className="grid grid-cols-1 gap-4 border-b border-line py-7 last:border-b-0 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
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
  const navigate = useNavigate();
  const { canal, cambiarCanal, cargarEjemplo, vaciar, clientes } = useCobranza();
  const { tema, alternarTema } = useUI();
  const [ajustes, setAjustes] = useState<AjustesTipo | null>(null);
  const [probando, setProbando] = useState(false);
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
      await api.actualizarTelefonoPrueba(telefono.trim() || null);
      toast.success(telefono.trim() ? 'Número de prueba guardado' : 'Número de prueba eliminado', {
        description: telefono.trim() ? 'Los mensajes de WhatsApp de la demo llegarán a este número.' : undefined
      });
    } catch (e) {
      toast.error('No se pudo guardar', { description: (e as Error).message });
    } finally {
      setGuardandoTel(false);
    }
  };

  const plantilla = plantillas.find((p) => p.tono === tono) ?? plantillas[0];

  const probar = async () => {
    setProbando(true);
    try {
      await api.probarConexionWhatsApp();
      toast.success('Conexión verificada', { description: 'WhatsApp Business responde correctamente.' });
    } catch (e) {
      toast.error('No se pudo conectar con WhatsApp', { description: (e as Error).message });
    } finally {
      setProbando(false);
    }
  };

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
                {perfil.iaActiva ? `Agentes con IA · ${perfil.modelo}` : 'Agentes en modo reglas (sin API key de IA)'}
              </p>
            </div>
            <Button variante="secundario" icono={LogOutIcon} onClick={() => void salir()}>
              Cerrar sesión
            </Button>
          </div>
        </Seccion>
    }
      <Seccion titulo="Canal activo" descripcion="Por dónde envían los agentes los mensajes de cobranza.">
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

      <Seccion titulo="Políticas de negociación" descripcion="Lo que el Negociador puede ofrecer y cuándo debe pasarle el caso a una persona.">
        <PoliticasForm />
      </Seccion>

      <Seccion titulo="Conexión con WhatsApp" descripcion="Cuenta de WhatsApp Business desde la que salen los mensajes.">
        {!ajustes ?
      <Skeleton className="h-28 w-full rounded-xl" /> :

      <div className="rounded-xl border border-line">
            <div className="flex items-center gap-3 border-b border-line p-4">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                {ajustes.whatsapp.conectado && <span className="absolute inset-0 rounded-full bg-ok opacity-50 motion-safe:animate-ping" />}
                <span className={cn('relative h-2.5 w-2.5 rounded-full', ajustes.whatsapp.conectado ? 'bg-ok' : 'bg-warn')} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{ajustes.whatsapp.conectado ? 'Conectado' : 'Desconectado'}</p>
                <p className="truncate text-xs text-muted">{ajustes.whatsapp.proveedor}</p>
              </div>
              <Button variante="secundario" tamano="sm" icono={RefreshCwIcon} onClick={probar} disabled={probando}>
                {probando ? 'Probando…' : 'Probar'}
              </Button>
            </div>
            <dl className="grid grid-cols-1 gap-px bg-line text-sm sm:grid-cols-3">
              {[
          { t: 'Número', v: ajustes.whatsapp.numero },
          { t: 'Plantillas aprobadas', v: `${ajustes.whatsapp.plantillasAprobadas} de 3` },
          { t: 'Última sincronización', v: tiempoRelativo(ajustes.whatsapp.ultimaSincronizacion) }].
          map((d) =>
          <div key={d.t} className="bg-surface px-4 py-3">
                  <dt className="text-xs text-muted">{d.t}</dt>
                  <dd className="mt-0.5 tabular-nums">{d.v}</dd>
                </div>
          )}
            </dl>
            {!usaDatosMock && !perfil?.esAnonimo &&
        <div className="border-t border-line p-4">
                <label htmlFor="tel-prueba" className="flex items-center gap-2 text-sm font-medium">
                  <PhoneIcon size={14} className="text-muted" aria-hidden="true" />
                  Tu WhatsApp para pruebas
                </label>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  El número de prueba de Meta solo puede escribir a destinatarios registrados. Todos los mensajes de la demo se redirigen aquí y tus respuestas llegan al Negociador.
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
            
                  <Button variante="secundario" onClick={() => void guardarTelefono()} disabled={guardandoTel || telefono.trim() === (ajustes.telefonoPrueba ?? '')}>
                    {guardandoTel ? 'Guardando…' : 'Guardar'}
                  </Button>
                </div>
              </div>
        }
          </div>
      }
      </Seccion>

      <Seccion titulo="Plantillas de mensaje" descripcion="El Redactor usa una por intento. Fuera de la ventana de 24 h, WhatsApp solo permite plantillas aprobadas.">
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

      <Seccion titulo="Recorrido guiado" descripcion="Vuelve a ver el paso a paso para conocer a los cuatro agentes.">
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