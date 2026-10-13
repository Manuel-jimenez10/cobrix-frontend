import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRightIcon,
  BanknoteIcon,
  BellRingIcon,
  CalendarCheckIcon,
  DatabaseIcon,
  GlobeIcon,
  LifeBuoyIcon,
  ListOrderedIcon,
  MenuIcon,
  MessageCircleIcon,
  SendIcon,
  ServerIcon,
  ShieldCheckIcon,
  SparklesIcon,
  XIcon } from
'lucide-react';
import { Logo } from '../../components/layout/Logo';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { Aparece, Codigo, Seccion, TarjetaEndpoint } from './componentes';
import { API, ENV_BACKEND, ENV_FRONTEND, TABLAS } from './datos';

const INDICE: {id: string;titulo: string;sub?: boolean;}[] = [
{ id: 'introduccion', titulo: 'Introducción' },
{ id: 'arquitectura', titulo: 'Arquitectura' },
{ id: 'flujo', titulo: 'Flujo de cobranza' },
{ id: 'prioridad', titulo: 'Cálculo de prioridad' },
{ id: 'guia', titulo: 'Guía y recorrido' },
{ id: 'api', titulo: 'API' },
...API.map((g) => ({ id: g.id, titulo: g.titulo, sub: true })),
{ id: 'datos', titulo: 'Modelo de datos' },
{ id: 'codigo', titulo: 'Estructura del código' },
{ id: 'entorno', titulo: 'Variables de entorno' },
{ id: 'local', titulo: 'Correr en local' },
{ id: 'despliegue', titulo: 'Despliegue' }];


const STACK = ['React 18', 'Vite', 'TypeScript', 'Tailwind', 'Framer Motion', 'Hono', 'Vercel AI SDK', 'Gemini', 'Zod', 'Supabase', 'WhatsApp Cloud API', 'Render', 'Vercel'];

/** Marca la sección visible en el índice lateral. */
function useSeccionActiva(ids: string[]) {
  const [activa, setActiva] = useState(ids[0]);
  useEffect(() => {
    let cuadro = 0;
    const calcular = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        // La última sección cuyo título ya pasó la barra superior.
        let actual = ids[0];
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= 140) actual = id;
        }
        setActiva(actual);
      });
    };
    calcular();
    window.addEventListener('scroll', calcular, { passive: true });
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener('scroll', calcular);
    };
  }, [ids]);
  return activa;
}

function Indice({ activa, onNavegar }: {activa: string;onNavegar?: () => void;}) {
  return (
    <nav aria-label="Índice de la documentación">
      <ul className="space-y-0.5">
        {INDICE.map((s) =>
        <li key={s.id}>
            <a
            href={`#${s.id}`}
            onClick={onNavegar}
            className={cn(
              'relative block rounded-md py-1.5 text-sm transition-colors',
              s.sub ? 'pl-6 text-[13px]' : 'pl-3',
              activa === s.id ? 'text-fg' : 'text-muted hover:text-fg'
            )}>

              {activa === s.id && <motion.span layoutId="indice-activo" className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-brand" transition={{ duration: 0.2, ease: EASE_OUT }} />}
              {s.titulo}
            </a>
          </li>
        )}
      </ul>
    </nav>);

}

/* ───────────── Hero ───────────── */

const LINEAS_STREAM = [
'{"tipo":"progreso","progreso":{"fase":"analizando"}}',
'{"tipo":"progreso","progreso":{"fase":"enviando","actualId":"c02"}}',
'{"tipo":"progreso","progreso":{"fase":"enviando","actualId":"c07"}}',
'{"tipo":"resultado","resultado":{"enviados":7,"omitidos":[…]}}'];


function TerminalAnimada() {
  const reducir = useReducedMotion();
  const [visibles, setVisibles] = useState(reducir ? LINEAS_STREAM.length : 0);
  useEffect(() => {
    if (reducir) return;
    const t = setInterval(() => setVisibles((v) => v >= LINEAS_STREAM.length + 3 ? 0 : v + 1), 900);
    return () => clearInterval(t);
  }, [reducir]);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[rgb(8_9_11)] shadow-2xl shadow-black/40">
      <div className="flex h-10 items-center gap-1.5 border-b border-line/70 px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-ok/70" />
        <span className="ml-3 font-mono text-[11px] text-muted">POST /cobranza/iniciar</span>
      </div>
      <div className="min-h-[188px] space-y-1.5 p-4 font-mono text-[12px] leading-relaxed">
        <p className="text-muted">
          <span className="text-brand">$</span> curl -N -H &quot;Authorization: Bearer $JWT&quot; …
        </p>
        {LINEAS_STREAM.slice(0, visibles).map((l, i) =>
        <motion.p key={i + l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className={cn('break-all', i === LINEAS_STREAM.length - 1 ? 'text-brand' : 'text-[rgb(214_220_228)]')}>
            {l}
          </motion.p>
        )}
        {visibles < LINEAS_STREAM.length && <span className="inline-block h-4 w-2 translate-y-0.5 bg-brand motion-safe:animate-pulse" aria-hidden="true" />}
      </div>
    </div>);

}

function Hero() {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgb(var(--line))_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]"
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <div>
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            <SparklesIcon size={13} aria-hidden="true" /> Documentación técnica
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05, ease: EASE_OUT }} className="mt-5 text-[38px] font-semibold leading-[1.05] tracking-tight sm:text-[48px]">
            Cobranza por WhatsApp,
            <br />
            <span className="text-brand">explicada de punta a punta.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12, ease: EASE_OUT }} className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
            Cómo está construido Cobrix: la arquitectura, el flujo de cobro, la API REST con streaming, el modelo de datos y cómo desplegarlo con planes gratuitos.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18, ease: EASE_OUT }} className="mt-7 flex flex-wrap gap-3">
            <a href="#api" className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-on-brand transition-colors hover:bg-brand/90">
              Ver la API <ArrowRightIcon size={15} aria-hidden="true" />
            </a>
            <Link to="/demo" className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-surface-2 px-5 text-sm font-medium transition-colors hover:bg-line/70">
              Probar la demo
            </Link>
          </motion.div>
          <motion.ul initial="oculto" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.03, delayChildren: 0.3 } } }} className="mt-8 flex flex-wrap gap-1.5">
            {STACK.map((s) =>
            <motion.li key={s} variants={{ oculto: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }} className="rounded-md border border-line bg-surface/70 px-2 py-1 text-[11.5px] text-muted">
                {s}
              </motion.li>
            )}
          </motion.ul>
        </div>
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}>
          <TerminalAnimada />
        </motion.div>
      </div>
    </header>);

}

/* ───────────── Arquitectura ───────────── */

const NODOS = [
{ id: 'web', x: 40, y: 40, titulo: 'Navegador', sub: 'React + Vite · Vercel', icono: GlobeIcon },
{ id: 'api', x: 340, y: 150, titulo: 'API de Cobrix', sub: 'Hono + AI SDK · Render', icono: ServerIcon },
{ id: 'db', x: 640, y: 40, titulo: 'Supabase', sub: 'Auth · Postgres + RLS · Realtime', icono: DatabaseIcon },
{ id: 'wa', x: 640, y: 260, titulo: 'WhatsApp', sub: 'Cloud API de Meta', icono: MessageCircleIcon },
{ id: 'ia', x: 40, y: 260, titulo: 'Gemini', sub: 'Guía · Google AI Studio', icono: SparklesIcon }];


const ENLACES: {de: string;a: string;texto: string;curva?: number;}[] = [
{ de: 'web', a: 'db', texto: 'login · Realtime (solo lectura)', curva: -40 },
{ de: 'web', a: 'api', texto: 'REST + NDJSON con JWT' },
{ de: 'api', a: 'db', texto: 'service role' },
{ de: 'api', a: 'wa', texto: 'plantillas · webhook' },
{ de: 'api', a: 'ia', texto: 'streamText + tools' }];


function Diagrama() {
  const reducir = useReducedMotion();
  const ANCHO = 200,
    ALTO = 64;
  const centro = (id: string) => {
    const n = NODOS.find((x) => x.id === id)!;
    return { x: n.x + ANCHO / 2, y: n.y + ALTO / 2 };
  };
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface/60 p-4">
      <svg viewBox="0 0 880 360" className="mx-auto block w-full min-w-[640px] max-w-4xl" role="img" aria-label="Diagrama de arquitectura de Cobrix">
        <defs>
          <linearGradient id="flujo" x1="0" x2="1">
            <stop offset="0" stopColor="rgb(var(--brand))" stopOpacity="0" />
            <stop offset="0.5" stopColor="rgb(var(--brand))" stopOpacity="1" />
            <stop offset="1" stopColor="rgb(var(--brand))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ENLACES.map((e, i) => {
          const a = centro(e.de);
          const b = centro(e.a);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2 + (e.curva ?? 0);
          const d = `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
          return (
            <g key={i}>
              <motion.path d={d} fill="none" stroke="rgb(var(--line))" strokeWidth={1.5} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 * i }} />
              {!reducir &&
              <motion.path d={d} fill="none" stroke="url(#flujo)" strokeWidth={2.5} strokeDasharray="40 400" animate={{ strokeDashoffset: [440, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', delay: i * 0.4 }} />
              }
              <text x={mx} y={my - 6} textAnchor="middle" className="fill-[rgb(var(--muted))] text-[11px]">
                {e.texto}
              </text>
            </g>);

        })}
        {NODOS.map((n, i) =>
        <motion.g key={n.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 * i }}>
            <rect x={n.x} y={n.y} width={ANCHO} height={ALTO} rx={14} fill="rgb(var(--surface))" stroke={n.id === 'api' ? 'rgb(var(--brand))' : 'rgb(var(--line))'} strokeWidth={n.id === 'api' ? 1.5 : 1} />
            <foreignObject x={n.x + 12} y={n.y + 16} width={32} height={32}>
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand/15 text-brand">
                <n.icono size={15} />
              </div>
            </foreignObject>
            <text x={n.x + 54} y={n.y + 29} className="fill-[rgb(var(--fg))] text-[13px] font-semibold">
              {n.titulo}
            </text>
            <text x={n.x + 54} y={n.y + 46} className="fill-[rgb(var(--muted))] text-[10.5px]">
              {n.sub}
            </text>
          </motion.g>
        )}
      </svg>
    </div>);

}

const DECISIONES = [
{ icono: ShieldCheckIcon, titulo: 'Multiusuario con RLS', texto: 'Cada fila tiene user_id. El navegador solo puede leer lo suyo; todas las escrituras pasan por la API, que verifica el JWT.' },
{ icono: SendIcon, titulo: 'Plantillas, no IA, para cobrar', texto: 'Los recordatorios son plantillas aprobadas por Meta: predecibles, instantáneas y válidas fuera de la ventana de 24 h.' },
{ icono: MessageCircleIcon, titulo: 'La relación la lleva una persona', texto: 'Cuando el cliente responde, nadie le contesta automáticamente: se pausan sus recordatorios y se avisa al equipo.' },
{ icono: LifeBuoyIcon, titulo: 'Una sola IA: la Guía', texto: 'Enseña a usar la app con cifras reales (tool calling) y nunca inventa datos. Sin API key, responde por reglas.' },
{ icono: ServerIcon, titulo: 'Canal desacoplado', texto: 'La interfaz CanalMensajeria tiene WhatsAppCloud y Simulador. Agregar Telegram o SMS no toca el resto.' },
{ icono: SparklesIcon, titulo: 'Proveedor de IA intercambiable', texto: 'Con el Vercel AI SDK, pasar de Gemini a OpenAI o Claude es cambiar una línea en agents/modelo.ts.' }];


/* ───────────── Flujo ───────────── */

const FLUJO = [
{ icono: ListOrderedIcon, titulo: 'Priorizar', texto: 'Score 0-100 por reglas. La cartera se ordena sola y cada cliente muestra el porqué.', api: 'GET /clientes' },
{ icono: SendIcon, titulo: 'Enviar recordatorios', texto: 'Plantilla amable → firme → final según los intentos, respetando horario y tono máximo.', api: 'POST /cobranza/iniciar' },
{ icono: BellRingIcon, titulo: 'El cliente responde', texto: 'Llega por el webhook de WhatsApp: queda en "Requiere atención" y se pausan sus recordatorios.', api: 'POST /webhooks/whatsapp' },
{ icono: MessageCircleIcon, titulo: 'Tú contestas', texto: 'Texto libre dentro de la ventana de 24 h, desde la conversación del cliente.', api: 'POST /clientes/:id/responder' },
{ icono: CalendarCheckIcon, titulo: 'Registrar la promesa', texto: 'Monto y fecha acordados. Los recordatorios esperan hasta ese día.', api: 'POST /clientes/:id/promesa' },
{ icono: BanknoteIcon, titulo: 'Cobrar', texto: 'Promesa cumplida o cliente pagado: se suma a "Recuperado este mes".', api: 'POST /promesas/:id/cumplir' }];


function Flujo() {
  return (
    <ol className="relative grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {FLUJO.map((p, i) =>
      <Aparece key={p.titulo} retraso={i * 0.06}>
          <li className="group h-full rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand/40">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/15 text-brand transition-transform duration-300 group-hover:scale-110">
                <p.icono size={16} aria-hidden="true" />
              </span>
              <span className="font-mono text-xs text-muted">0{i + 1}</span>
            </div>
            <p className="mt-4 font-semibold">{p.titulo}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.texto}</p>
            <p className="mt-4 inline-block rounded-md bg-surface-2 px-2 py-1 font-mono text-[11.5px] text-muted">{p.api}</p>
          </li>
        </Aparece>
      )}
    </ol>);

}

/* ───────────── Prioridad ───────────── */

const FACTORES = [
{ nombre: 'Días de atraso', max: 45, formula: 'min(atraso / 120, 1) × 45', color: 'bg-bad' },
{ nombre: 'Monto vs. mayor saldo', max: 35, formula: '(deuda / deuda máxima) × 35', color: 'bg-warn' },
{ nombre: 'Mensajes sin respuesta', max: 15, formula: 'min(seguidos, 3) × 5', color: 'bg-promise' },
{ nombre: 'Promesas incumplidas', max: 16, formula: '+8 por cada una', color: 'bg-analista' }];


function Prioridad() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
        {FACTORES.map((f, i) =>
        <div key={f.nombre}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{f.nombre}</span>
              <span className="font-mono text-xs text-muted">{f.formula}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <motion.div className={cn('h-full rounded-full', f.color)} initial={{ width: 0 }} whileInView={{ width: `${f.max / 45 * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1, ease: EASE_OUT }} />
            </div>
          </div>
        )}
        <p className="border-t border-line pt-4 text-sm text-muted">
          Una promesa vigente resta <span className="font-mono text-fg">15</span>. El resultado se acota a 0-100: <span className="text-bad">alta ≥ 70</span> ·{' '}
          <span className="text-warn">media ≥ 40</span> · baja.
        </p>
      </div>
      <Codigo
        titulo="agents/analista.ts"
        codigo={`const atraso   = Math.min(c.diasAtraso / 120, 1) * 45;
const monto    = (c.deuda / maxDeuda) * 35;
const silencio = Math.min(sinRespuesta, 3) * 5;
const promesa  = promesaActiva ? -15 : 0;

const score = clamp(0, 100, Math.round(
  atraso + monto + silencio + incumplidas * 8 + promesa
));
// nivel: alta >= 70 · media >= 40 · baja`} />

    </div>);

}

/* ───────────── Página ───────────── */

export function Docs() {
  const ids = useMemo(() => INDICE.map((s) => s.id), []);
  const activa = useSeccionActiva(ids);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    document.title = 'Cobrix · Documentación';
    return () => {
      document.title = 'Cobrix';
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-bg text-fg">
      <div className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link to="/docs" aria-label="Documentación de Cobrix" className="flex items-center gap-2">
            <Logo />
            <span className="hidden rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted sm:inline">Docs</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-sm">
            <a href="#api" className="hidden rounded-md px-3 py-1.5 text-muted hover:text-fg sm:block">
              API
            </a>
            <a href="#despliegue" className="hidden rounded-md px-3 py-1.5 text-muted hover:text-fg sm:block">
              Despliegue
            </a>
            <Link to="/demo" className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-sm font-semibold text-on-brand hover:bg-brand/90">
              Abrir la app
            </Link>
            <button type="button" onClick={() => setMenu(true)} aria-label="Abrir índice" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg lg:hidden">
              <MenuIcon size={18} />
            </button>
          </nav>
        </div>
      </div>

      {menu &&
      <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenu(false)} />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ duration: 0.25, ease: EASE_OUT }} className="absolute inset-y-0 right-0 w-72 overflow-y-auto border-l border-line bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Contenido</p>
              <button type="button" onClick={() => setMenu(false)} aria-label="Cerrar índice" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2">
                <XIcon size={18} />
              </button>
            </div>
            <Indice activa={activa} onNavegar={() => setMenu(false)} />
          </motion.aside>
        </div>
      }

      <Hero />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 py-14">
            <Indice activa={activa} />
          </div>
        </aside>

        <main className="min-w-0">
          <Seccion
            id="introduccion"
            eyebrow="Visión general"
            titulo="Qué es Cobrix"
            descripcion="Una app de gestión de cobranza para PyMEs mexicanas. Automatiza lo repetitivo —decidir a quién cobrar y mandar recordatorios por WhatsApp— y deja la conversación y los acuerdos de pago en manos de una persona del equipo. La única IA es la Guía, que le enseña al usuario a usar la app.">

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
              { k: '2 repos', v: 'cobrix-frontend (Vercel) y cobrix-backend (Render)' },
              { k: `${API.reduce((n, g) => n + g.endpoints.length, 0)} endpoints`, v: 'REST + 2 en streaming NDJSON' },
              { k: '$0 / mes', v: 'Todo con planes gratuitos' }].
              map((x, i) =>
              <Aparece key={x.k} retraso={i * 0.06}>
                  <div className="rounded-2xl border border-line bg-surface p-5">
                    <p className="text-2xl font-semibold tracking-tight">{x.k}</p>
                    <p className="mt-1 text-sm text-muted">{x.v}</p>
                  </div>
                </Aparece>
              )}
            </div>
          </Seccion>

          <Seccion id="arquitectura" eyebrow="Arquitectura" titulo="Cómo se conectan las piezas" descripcion="El navegador lee directo de Supabase (con RLS) para el login y los eventos en vivo; todo lo demás pasa por la API, que es la única que escribe.">
            <Aparece>
              <Diagrama />
            </Aparece>
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              {DECISIONES.map((d, i) =>
              <Aparece key={d.titulo} retraso={i * 0.04}>
                  <div className="flex h-full gap-3 rounded-2xl border border-line bg-surface p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand">
                      <d.icono size={16} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{d.titulo}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{d.texto}</p>
                    </div>
                  </div>
                </Aparece>
              )}
            </div>
          </Seccion>

          <Seccion id="flujo" eyebrow="Producto" titulo="Flujo de cobranza" descripcion="Seis pasos, cada uno respaldado por un endpoint. La app y el recorrido guiado siguen este mismo orden.">
            <Flujo />
          </Seccion>

          <Seccion id="prioridad" eyebrow="Reglas" titulo="Cálculo de prioridad" descripcion="Determinista, instantáneo y explicable: el equipo siempre sabe por qué un cliente va primero.">
            <Prioridad />
          </Seccion>

          <Seccion id="guia" eyebrow="IA + UX" titulo="Guía y recorrido guiado" descripcion="El recorrido oscurece la pantalla, ilumina el botón exacto y avanza solo cuando el usuario hace la acción. La Guía reutiliza el mismo mecanismo para señalar dónde presionar.">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Aparece>
                <Codigo
                  titulo="1 · Marca el elemento"
                  codigo={`<Button data-tour="registrar-promesa" onClick={abrir}>
  Registrar promesa
</Button>`} />

              </Aparece>
              <Aparece retraso={0.05}>
                <Codigo
                  titulo="2 · Declara el paso (components/tour/pasos.ts)"
                  codigo={`{
  id: 'promesa',
  objetivo: () => ['registrar-promesa'],
  titulo: () => 'Registra lo que acordaron',
  texto: () => 'Presiona “Registrar promesa”.',
  avance: { tipo: 'clic' },   // o 'ruta' | 'evento' | 'siguiente'
  ruta: (c) => \`/cartera/\${c.clienteId}\`
}`} />

              </Aparece>
              <Aparece retraso={0.1}>
                <Codigo
                  titulo="3 · Avisa cuando la acción se completó"
                  codigo={`import { avisarTutorial } from '../utils/tutorial';

await api.registrarPromesa(id, datos);
avisarTutorial('promesa');   // avanza los pasos { tipo: 'evento' }`} />

              </Aparece>
              <Aparece retraso={0.15}>
                <Codigo
                  titulo="4 · La Guía propone el botón (agents/guia.ts)"
                  codigo={`mostrar_boton: tool({
  inputSchema: z.object({
    destino: z.enum(DESTINOS),   // 'registrar_promesa', 'atencion', …
    etiqueta: z.string().max(40),
    clienteId: z.string().optional()
  }),
  execute: async (accion) => {
    emitir({ tipo: 'accion', accion });   // el front navega e ilumina
    return { mostrado: true };
  }
})`} />

              </Aparece>
            </div>
          </Seccion>

          <Seccion
            id="api"
            eyebrow="Referencia"
            titulo="API"
            descripcion={
            <>
                Base: <span className="font-mono text-fg">https://cobrix-backend-a53u.onrender.com</span>. JSON en todas las rutas; las de IA y envío responden en streaming NDJSON.
              </>
            }>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Aparece>
                <div className="h-full rounded-2xl border border-line bg-surface p-5">
                  <p className="font-semibold">Autenticación</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Envía el <span className="text-fg">access token de Supabase</span> (correo, Google o invitado). La API lo valida, crea el perfil en el primer acceso y filtra todo por su user_id.
                  </p>
                  <Codigo className="mt-4" titulo="Header" codigo={`Authorization: Bearer <access_token de supabase.auth.getSession()>`} />
                </div>
              </Aparece>
              <Aparece retraso={0.05}>
                <div className="h-full rounded-2xl border border-line bg-surface p-5">
                  <p className="font-semibold">Errores</p>
                  <p className="mt-1.5 text-sm text-muted">Siempre con la forma:</p>
                  <Codigo className="mt-3" titulo="JSON" codigo={`{ "error": "La ventana de 24 h de WhatsApp está cerrada…" }`} />
                  <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted">
                    <li><span className="font-mono text-fg">400</span> datos inválidos (Zod)</li>
                    <li><span className="font-mono text-fg">401</span> sin sesión o expirada</li>
                    <li><span className="font-mono text-fg">404</span> no encontrado</li>
                    <li><span className="font-mono text-fg">409</span> regla de negocio</li>
                    <li><span className="font-mono text-fg">429</span> límite de IA</li>
                    <li><span className="font-mono text-fg">500</span> error interno</li>
                  </ul>
                </div>
              </Aparece>
            </div>

            <Aparece className="mt-4">
              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="font-semibold">Leer un stream NDJSON</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">Una línea JSON por evento: la UI pinta el progreso y el texto de la IA mientras se genera. Si algo falla a mitad, llega una línea {'{"tipo":"error","mensaje":"…"}'}.</p>
                <Codigo
                  className="mt-4"
                  titulo="services/httpApi.ts"
                  codigo={`const res = await fetch(\`\${API}/guia/chat\`, { method: 'POST', headers, body });
const lector = res.body!.getReader();
const decoder = new TextDecoder();
let resto = '';
for (;;) {
  const { value, done } = await lector.read();
  if (done) break;
  resto += decoder.decode(value, { stream: true });
  const lineas = resto.split('\\n');
  resto = lineas.pop() ?? '';
  for (const l of lineas) if (l.trim()) manejar(JSON.parse(l));
}`} />

              </div>
            </Aparece>

            {API.map((g) =>
            <div key={g.id} id={g.id} className="scroll-mt-24 pt-12">
                <Aparece>
                  <h3 className="text-lg font-semibold">{g.titulo}</h3>
                  <p className="mt-1 text-sm text-muted">{g.descripcion}</p>
                </Aparece>
                <div className="mt-4 space-y-2">
                  {g.endpoints.map((e, i) =>
                <Aparece key={e.metodo + e.ruta} retraso={Math.min(i * 0.03, 0.2)}>
                      <TarjetaEndpoint e={e} abiertoInicial={e.ruta === '/cobranza/iniciar'} />
                    </Aparece>
                )}
                </div>
              </div>
            )}
          </Seccion>

          <Seccion id="datos" eyebrow="Supabase" titulo="Modelo de datos" descripcion="Postgres con RLS: cada tabla tiene user_id y una política de “lectura propia”. Las escrituras las hace la API con la service role. eventos_agente, mensajes y promesas se publican por Realtime.">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {TABLAS.map((t, i) =>
              <Aparece key={t.nombre} retraso={i * 0.03}>
                  <div className="h-full rounded-2xl border border-line bg-surface p-4">
                    <p className="font-mono text-sm font-semibold text-brand">{t.nombre}</p>
                    <p className="mt-1 text-sm text-muted">{t.descripcion}</p>
                    <p className="mt-3 font-mono text-[11.5px] leading-relaxed text-muted/80">{t.columnas}</p>
                  </div>
                </Aparece>
              )}
            </div>
          </Seccion>

          <Seccion id="codigo" eyebrow="Repos" titulo="Estructura del código">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Aparece>
                <Codigo
                  titulo="cobrix-backend · Render"
                  codigo={`src/
├── index.ts          Hono: CORS, /health, webhook y rutas privadas
├── env.ts            variables de entorno
├── middleware/auth   JWT de Supabase, perfil y límite de IA
├── routes/
│   ├── datos.ts      cartera, ajustes, reglas, demo
│   ├── agentes.ts    cobranza (NDJSON), conversación, Guía
│   └── webhook.ts    WhatsApp entrante (firma HMAC)
├── services/
│   └── cobranza.ts   iniciar, recibir, responder, promesa
├── agents/
│   ├── analista.ts   prioridad por reglas
│   ├── redactor.ts   plantillas
│   ├── guia.ts       IA: manual + tools
│   └── modelo.ts     proveedor de IA (Gemini)
├── channels/         WhatsApp Cloud API y simulador
├── domain/           acceso a datos, lógica y datos demo
└── shared/           tipos, reglas, plantillas, políticas
supabase/schema.sql   tablas, RLS, índices y Realtime
render.yaml           Blueprint de Render
.github/workflows/    ping para que Render no se duerma`} />

              </Aparece>
              <Aparece retraso={0.05}>
                <Codigo
                  titulo="cobrix-frontend · Vercel"
                  codigo={`src/
├── App.tsx              rutas públicas (/docs, /privacidad) y privadas
├── services/
│   ├── api.ts           elige API real o mock según el entorno
│   ├── httpApi.ts       fetch + JWT, NDJSON y Realtime
│   └── mockApi.ts       demo sin backend (datos en memoria)
├── contexts/            Auth, Cobranza, Guía, Tutorial, UI
├── pages/               Inicio, Cartera, Promesas, Guía, Ajustes, Docs
├── components/
│   ├── cliente/         conversación, composer, promesa
│   ├── cartera/         lista, filtros, envío de recordatorios
│   ├── dashboard/       KPIs, atención, actividad
│   ├── guia/            chat y panel de la Guía
│   └── tour/            recorrido: pasos y Spotlight
└── utils/tutorial.ts    eventos del recorrido
vercel.json              rewrite de la SPA`} />

              </Aparece>
            </div>
          </Seccion>

          <Seccion id="entorno" eyebrow="Configuración" titulo="Variables de entorno" descripcion="Las secretas van solo en Render. El frontend usa únicamente la clave pública de Supabase.">
            <Aparece>
              <p className="mb-2 text-sm font-semibold">Backend (Render · cobrix-backend/.env)</p>
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <tbody className="divide-y divide-line">
                    {ENV_BACKEND.map((v) =>
                    <tr key={v.nombre} className="bg-surface">
                        <td className="px-4 py-2.5 font-mono text-[12.5px] text-fg">
                          {v.nombre}
                          {v.requerida && <span className="ml-1.5 text-bad">*</span>}
                        </td>
                        <td className="px-4 py-2.5 text-muted">{v.descripcion}</td>
                        <td className="px-4 py-2.5 font-mono text-[11.5px] text-muted/80">{v.ejemplo}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Aparece>
            <Aparece className="mt-6">
              <p className="mb-2 text-sm font-semibold">Frontend (Vercel · cobrix-frontend/.env.local)</p>
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <tbody className="divide-y divide-line">
                    {ENV_FRONTEND.map((v) =>
                    <tr key={v.nombre} className="bg-surface">
                        <td className="px-4 py-2.5 font-mono text-[12.5px] text-fg">{v.nombre}</td>
                        <td className="px-4 py-2.5 text-muted">{v.descripcion}</td>
                        <td className="px-4 py-2.5 font-mono text-[11.5px] text-muted/80">{v.ejemplo}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted">Sin variables, el frontend arranca en modo demo con datos en memoria. Vite incrusta las variables al compilar: tras cambiarlas, vuelve a desplegar.</p>
            </Aparece>
          </Seccion>

          <Seccion id="local" eyebrow="Desarrollo" titulo="Correr en local">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Aparece>
                <Codigo
                  titulo="Terminal 1 · backend"
                  codigo={`cd cobrix-backend
cp .env.example .env     # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY…
npm install
npm run dev              # http://localhost:8787/health`} />

              </Aparece>
              <Aparece retraso={0.05}>
                <Codigo
                  titulo="Terminal 2 · frontend"
                  codigo={`cd cobrix-frontend
cp .env.example .env.local   # VITE_AGENTS_API_URL=http://localhost:8787
npm install
npm run dev                  # http://localhost:5173`} />

              </Aparece>
            </div>
          </Seccion>

          <Seccion id="despliegue" eyebrow="Producción" titulo="Despliegue" descripcion="Todo con planes gratuitos. El orden importa: primero la base de datos, luego la API y al final el frontend.">
            <ol className="space-y-3">
              {[
              { t: 'Supabase', d: 'Ejecuta supabase/schema.sql en el SQL Editor. Activa “Allow anonymous sign-ins” (demo de invitado) y, para Google, el proveedor Google con el Client ID y el Secret. En URL Configuration pon la URL de Vercel.' },
              { t: 'Render (API)', d: 'New → Blueprint con el repo cobrix-backend (usa render.yaml). Pega las variables y en CORS_ORIGINS la URL de Vercel. El workflow de GitHub hace ping a /health cada 5 min con el secreto RENDER_HEALTH_URL.' },
              { t: 'Vercel (frontend)', d: 'Importa cobrix-frontend con el preset Vite y agrega las tres variables VITE_*. vercel.json ya resuelve las rutas de la SPA.' },
              { t: 'Google OAuth', d: 'Google Auth Platform → cliente “Aplicación web”. Redirect URI: https://<proyecto>.supabase.co/auth/v1/callback. Con los permisos básicos no hace falta verificar la app.' },
              { t: 'WhatsApp', d: 'En Meta: producto WhatsApp, cuenta de WhatsApp Business con método de pago, token de usuario de sistema y webhook https://<api>/webhooks/whatsapp suscrito a “messages”. En Render: WHATSAPP_TOKEN, WHATSAPP_WABA_ID, WHATSAPP_VERIFY_TOKEN y WHATSAPP_APP_SECRET. Cada empresa conecta su número desde Ajustes (código por SMS) y Cobrix crea las plantillas.' }].
              map((p, i) =>
              <Aparece key={p.t} retraso={i * 0.05}>
                  <li className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-on-brand">{i + 1}</span>
                    <div>
                      <p className="font-semibold">{p.t}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{p.d}</p>
                    </div>
                  </li>
                </Aparece>
              )}
            </ol>
          </Seccion>

          <footer className="flex flex-col items-start justify-between gap-3 py-10 text-sm text-muted sm:flex-row sm:items-center">
            <p>Cobrix · cobranza por WhatsApp para PyMEs mexicanas</p>
            <div className="flex gap-4">
              <Link to="/privacidad" className="hover:text-fg">
                Privacidad
              </Link>
              <Link to="/terminos" className="hover:text-fg">
                Términos
              </Link>
              <Link to="/demo" className="text-brand hover:underline">
                Abrir la app →
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>);

}
