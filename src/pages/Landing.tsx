import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRightIcon,
  BanknoteIcon,
  BellRingIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  CheckCheckIcon,
  CheckIcon,
  ClockIcon,
  GraduationCapIcon,
  LifeBuoyIcon,
  ListOrderedIcon,
  LockIcon,
  MenuIcon,
  MessageCircleIcon,
  SendIcon,
  ShieldCheckIcon,
  XIcon } from
'lucide-react';
import { Logo } from '../components/layout/Logo';
import { AnimatedValue } from '../components/ui/AnimatedValue';
import { Money } from '../components/ui/Money';
import { cn } from '../utils/cn';
import { EASE_OUT } from '../utils/motion';

/* ───────────── Piezas reutilizables ───────────── */

function Aparece({ children, retraso = 0, className }: {children: React.ReactNode;retraso?: number;className?: string;}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: retraso, ease: EASE_OUT }}
      className={cn('min-w-0', className)}>

      {children}
    </motion.div>);

}

function Eyebrow({ children }: {children: React.ReactNode;}) {
  return <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{children}</p>;
}

function BotonPrimario({ to, children, className }: {to: string;children: React.ReactNode;className?: string;}) {
  return (
    <Link to={to} className={cn('group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-brand px-6 text-[15px] font-semibold text-on-brand shadow-lg shadow-brand/20 transition-transform active:scale-[0.98]', className)}>
      <span aria-hidden="true" className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
      <ArrowRightIcon size={16} className="relative transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>);

}

function BotonSecundario({ to, children, className }: {to: string;children: React.ReactNode;className?: string;}) {
  return (
    <Link to={to} className={cn('inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-surface-2/70 px-6 text-[15px] font-medium transition-colors hover:bg-line/70', className)}>
      {children}
    </Link>);

}

/* ───────────── Navegación ───────────── */

const ENLACES = [
{ href: '#como-funciona', texto: 'Cómo funciona' },
{ href: '#funciones', texto: 'Funciones' },
{ href: '#guia', texto: 'IA' }];


function Nav() {
  const [abierto, setAbierto] = useState(false);
  const { scrollY } = useScroll();
  const fondo = useTransform(scrollY, [0, 60], [0, 1]);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div style={{ opacity: fondo }} className="absolute inset-0 border-b border-line bg-bg/80 backdrop-blur-xl" aria-hidden="true" />
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" aria-label="Cobrix">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Secciones">
          {ENLACES.map((e) =>
          <a key={e.href} href={e.href} className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg">
              {e.texto}
            </a>
          )}
          <Link to="/docs" className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg">
            Documentación
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/entrar" className="hidden h-10 items-center rounded-lg px-4 text-sm font-medium text-muted transition-colors hover:text-fg sm:inline-flex">
            Entrar
          </Link>
          <Link to="/demo" className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-brand/90">
            Probar gratis
          </Link>
          <button type="button" onClick={() => setAbierto(true)} aria-label="Abrir menú" className="grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-surface-2 md:hidden">
            <MenuIcon size={19} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {abierto &&
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-xl md:hidden">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo />
              <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar menú" className="grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-surface-2">
                <XIcon size={20} />
              </button>
            </div>
            <motion.nav initial="o" animate="v" variants={{ v: { transition: { staggerChildren: 0.05 } } }} className="flex flex-col gap-1 px-4 pt-4">
              {[...ENLACES.map((e) => ({ ...e, to: undefined as string | undefined })), { href: '', texto: 'Documentación', to: '/docs' }, { href: '', texto: 'Entrar', to: '/entrar' }].map((e) =>
            <motion.div key={e.texto} variants={{ o: { opacity: 0, y: 8 }, v: { opacity: 1, y: 0 } }}>
                  {e.to ?
              <Link to={e.to} className="block rounded-xl px-3 py-3 text-xl font-semibold">
                      {e.texto}
                    </Link> :

              <a href={e.href} onClick={() => setAbierto(false)} className="block rounded-xl px-3 py-3 text-xl font-semibold">
                      {e.texto}
                    </a>
              }
                </motion.div>
            )}
              <BotonPrimario to="/demo" className="mt-6 justify-center">
                Probar la demo gratis
              </BotonPrimario>
            </motion.nav>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}

/* ───────────── Hero: teléfono animado ───────────── */

type Burbuja = {id: string;de: 'nos' | 'cliente' | 'sistema';texto: string;etiqueta?: string;};

const GUION: Burbuja[] = [
{ id: 'b1', de: 'nos', etiqueta: 'Redactado con IA · amable', texto: 'Hola Jorge, te escribimos de Distribuidora del Valle: la factura F-1042 por $28,500.00 está pendiente. ¿Nos confirmas la fecha de pago?' },
{ id: 'b2', de: 'cliente', texto: 'Hola, sí. ¿Podemos verlo en dos pagos?' },
{ id: 'b3', de: 'sistema', texto: 'La IA sugiere: aceptar dos pagos' },
{ id: 'b4', de: 'nos', etiqueta: 'Tú', texto: 'Claro, Jorge. Te queda la mitad el viernes y el resto en 15 días.' },
{ id: 'b5', de: 'cliente', texto: '¡Perfecto, así lo hacemos! 👍' },
{ id: 'b6', de: 'sistema', texto: 'Promesa detectada · $14,250.00 · viernes' }];


function Telefono() {
  const reducir = useReducedMotion();
  const [paso, setPaso] = useState(reducir ? GUION.length : 1);
  useEffect(() => {
    if (reducir) return;
    const t = setTimeout(() => setPaso((p) => p >= GUION.length + 2 ? 1 : p + 1), paso >= GUION.length ? 2600 : 1500);
    return () => clearTimeout(t);
  }, [paso, reducir]);
  const visibles = GUION.slice(0, Math.min(paso, GUION.length));
  const escribiendo = !reducir && paso < GUION.length && GUION[paso]?.de === 'cliente';

  return (
    <div className="relative mx-auto w-[300px] sm:w-[320px]">
      <div className="relative overflow-hidden rounded-[2.4rem] border border-line bg-[rgb(11_20_17)] p-2 shadow-2xl shadow-black/60">
        <div className="overflow-hidden rounded-[2rem] bg-[rgb(12_19_17)]">
          <div className="flex items-center gap-3 border-b border-white/5 bg-[rgb(17_27_24)] px-4 pb-3 pt-6">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/20 text-sm font-semibold text-brand">FL</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Ferretería López</p>
              <p className="text-[11px] text-brand">{escribiendo ? 'escribiendo…' : 'en línea'}</p>
            </div>
          </div>
          <div className="flex h-[400px] flex-col justify-end gap-2 px-3 py-4">
            <AnimatePresence initial={false}>
              {visibles.map((b) =>
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: EASE_OUT }}
                className={cn('flex', b.de === 'nos' ? 'justify-end' : b.de === 'cliente' ? 'justify-start' : 'justify-center')}>

                  {b.de === 'sistema' ?
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium', b.texto.startsWith('Promesa') ? 'bg-promise/15 text-promise' : 'bg-warn/15 text-warn')}>
                      {b.texto.startsWith('Promesa') ? <CalendarCheckIcon size={12} /> : <BellRingIcon size={12} />}
                      {b.texto}
                    </span> :

                <div className={cn('max-w-[86%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug', b.de === 'nos' ? 'rounded-br-md bg-[rgb(0_92_75)] text-white' : 'rounded-bl-md bg-[rgb(32_44_51)] text-white')}>
                      {b.etiqueta && <p className="mb-0.5 text-[10px] font-semibold text-brand">{b.etiqueta}</p>}
                      {b.texto}
                      <span className="mt-0.5 flex items-center justify-end gap-1 text-[9.5px] text-white/50">
                        10:2{b.id.slice(1)} {b.de === 'nos' && <CheckCheckIcon size={11} className="text-promise" />}
                      </span>
                    </div>
                }
                </motion.div>
              )}
            </AnimatePresence>
            {escribiendo &&
            <div className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-[rgb(32_44_51)] px-3 py-2.5">
                {[0, 1, 2].map((i) =>
              <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-white/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
              )}
              </div>
            }
          </div>
        </div>
      </div>

      {/* Tarjetas flotantes */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, y: reducir ? 0 : [0, -8, 0] }}
        transition={{ opacity: { delay: 0.6 }, x: { delay: 0.6, duration: 0.5 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute -left-14 top-6 hidden rounded-2xl border border-line bg-surface/95 p-3.5 shadow-xl shadow-black/40 backdrop-blur sm:block lg:-left-36">

        <p className="text-[11px] text-muted">Recuperado este mes</p>
        <AnimatedValue valor={126400} duracion={1.6}>{(v) => <Money valor={v} className="mt-0.5 block text-xl font-semibold" />}</AnimatedValue>
        <p className="mt-0.5 text-[11px] font-medium text-ok">+18.2% vs. mes pasado</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, y: reducir ? 0 : [0, 8, 0] }}
        transition={{ opacity: { delay: 0.9 }, x: { delay: 0.9, duration: 0.5 }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute -right-12 -bottom-12 hidden w-48 rounded-2xl border border-line bg-surface/95 p-3.5 shadow-xl shadow-black/40 backdrop-blur sm:block lg:-right-28">

        <p className="flex items-center gap-1.5 text-[11px] text-muted">
          <ListOrderedIcon size={12} className="text-brand" /> A quién cobrar hoy
        </p>
        {[
        ['Taller Hernández', 81],
        ['Const. Ramírez', 74],
        ['Transportes Gómez', 70]].
        map(([n, s], i) =>
        <div key={n} className="mt-2">
            <div className="flex justify-between text-[11px]">
              <span className="truncate">{n}</span>
              <span className="tabular-nums text-muted">{s}</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-line">
              <motion.div className="h-full rounded-full bg-brand" initial={{ width: 0 }} animate={{ width: `${s}%` }} transition={{ delay: 1.1 + i * 0.15, duration: 0.8, ease: EASE_OUT }} />
            </div>
          </div>
        )}
      </motion.div>
    </div>);

}

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 80]);
  const reducir = useReducedMotion();
  return (
    <section className="relative overflow-hidden pt-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgb(var(--line))_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[900px] max-w-[160vw] -translate-x-1/2 rounded-full bg-brand/20 blur-[130px]"
        animate={reducir ? undefined : { opacity: [0.45, 0.8, 0.45], scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20">
        <div>
          <motion.a
            href="#guia"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 py-1 pl-1 pr-3 text-xs font-medium text-brand">

            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-on-brand">Nuevo</span>
            IA que redacta, sugiere y te enseña
            <ArrowRightIcon size={12} aria-hidden="true" />
          </motion.a>
          <h1 className="mt-6 text-[42px] font-semibold leading-[1.02] tracking-tight sm:text-[58px]">
            {['Cobra a tiempo', 'sin perseguir', 'a nadie.'].map((linea, i) =>
            <motion.span
              key={linea}
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.08 + i * 0.1, ease: EASE_OUT }}
              className={cn('block', i === 2 && 'text-brand')}>

                {linea}
              </motion.span>
            )}
          </h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.38, ease: EASE_OUT }} className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
            Cobrix ordena a quién cobrar primero, la IA redacta cada recordatorio y tú lo envías desde tu WhatsApp con un toque. Cuando un cliente responde, te sugiere qué contestar para que cierres el acuerdo.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.48, ease: EASE_OUT }} className="mt-8 flex flex-wrap gap-3">
            <BotonPrimario to="/demo">Probar la demo gratis</BotonPrimario>
            <BotonSecundario to="/entrar">Entrar</BotonSecundario>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {['Sin tarjeta', 'Desde tu propio WhatsApp', 'Entra con Google'].map((t) =>
            <li key={t} className="flex items-center gap-1.5">
                <CheckIcon size={14} className="text-brand" aria-hidden="true" />
                {t}
              </li>
            )}
          </motion.ul>
        </div>
        <motion.div style={{ y: reducir ? 0 : y }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT }}>
          <Telefono />
        </motion.div>
      </div>
    </section>);

}

/* ───────────── Cinta de tecnologías ───────────── */

const STACK = ['WhatsApp', 'Supabase', 'Vercel AI SDK', 'Gemini', 'React', 'Hono', 'TypeScript', 'Render', 'Vercel', 'Tailwind', 'Framer Motion', 'Zod'];

function Cinta() {
  const reducir = useReducedMotion();
  return (
    <div className="relative border-y border-line bg-surface/40 py-5 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <motion.div className="flex w-max gap-10 whitespace-nowrap" animate={reducir ? undefined : { x: ['0%', '-50%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
        {[...STACK, ...STACK].map((s, i) =>
        <span key={i} className="text-sm font-medium text-muted/80">
            {s}
          </span>
        )}
      </motion.div>
    </div>);

}

/* ───────────── Cómo funciona (con línea de progreso) ───────────── */

const PASOS = [
{ icono: ListOrderedIcon, titulo: 'Ve a quién cobrar primero', texto: 'Tu cartera se ordena sola por atraso, monto y respuestas. Cada cliente te dice por qué va primero.' },
{ icono: SendIcon, titulo: 'Revisa y envía desde tu WhatsApp', texto: 'La IA redacta el mensaje de cada cliente vencido con el tono que le toca: amable, firme o aviso final. Lo revisas y se abre tu WhatsApp con todo listo.' },
{ icono: BellRingIcon, titulo: 'Te ayuda a contestar', texto: 'Pega lo que te respondió el cliente: la IA te sugiere qué decir y detecta si prometió pagar. Sus recordatorios se pausan hasta que le contestes.' },
{ icono: CalendarCheckIcon, titulo: 'Registra y cobra la promesa', texto: 'Anota la fecha que acordaron y márcala cumplida cuando te paguen. Se suma a lo recuperado.' }];


function ComoFunciona() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const alto = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  return (
    <section id="como-funciona" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Aparece className="max-w-2xl">
          <Eyebrow>Cómo funciona</Eyebrow>
          <h2 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">Lo repetitivo lo hace Cobrix. La relación, en tus manos.</h2>
        </Aparece>
        <div ref={ref} className="relative mt-14 pl-12 sm:pl-16">
          <div className="absolute bottom-0 left-[18px] top-0 w-px bg-line sm:left-[26px]" aria-hidden="true" />
          <motion.div style={{ height: alto }} className="absolute left-[18px] top-0 w-px bg-brand sm:left-[26px]" aria-hidden="true" />
          <ol className="space-y-12">
            {PASOS.map((p, i) =>
            <li key={p.titulo} className="relative">
                <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute -left-12 grid h-9 w-9 place-items-center rounded-full border border-brand/50 bg-bg text-brand sm:-left-16 sm:h-[52px] sm:w-[52px]">

                  <p.icono size={18} aria-hidden="true" />
                </motion.span>
                <Aparece>
                  <p className="font-mono text-xs text-muted">Paso 0{i + 1}</p>
                  <h3 className="mt-1 text-xl font-semibold sm:text-2xl">{p.titulo}</h3>
                  <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">{p.texto}</p>
                </Aparece>
              </li>
            )}
          </ol>
        </div>
      </div>
    </section>);

}

/* ───────────── Funciones ───────────── */

const FUNCIONES = [
{ icono: MessageCircleIcon, titulo: 'Desde tu WhatsApp', texto: 'Sin configurar nada: se abre tu WhatsApp con el chat y el mensaje listos. Tus clientes ven el número que ya conocen. API oficial de Meta, próximamente.' },
{ icono: ClockIcon, titulo: 'Horarios y tono', texto: 'Define cuándo se pueden enviar recordatorios y qué tan firmes pueden ser.' },
{ icono: BellRingIcon, titulo: 'Nada de mensajes de más', texto: 'Si el cliente ya respondió o prometió pagar, Cobrix no te propone volver a escribirle.' },
{ icono: BanknoteIcon, titulo: 'Recuperado en vivo', texto: 'Por cobrar, vencido, antigüedad y lo recuperado del mes, actualizados en tiempo real.' },
{ icono: ShieldCheckIcon, titulo: 'Tus datos, solo tuyos', texto: 'Cada cuenta está aislada en la base de datos. Entra con tu correo o con Google.' },
{ icono: GraduationCapIcon, titulo: 'Recorrido guiado', texto: 'La primera vez, la app te ilumina cada botón y avanza contigo paso a paso.' }];


function Funciones() {
  return (
    <section id="funciones" className="scroll-mt-20 border-t border-line bg-surface/30 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Aparece className="max-w-2xl">
          <Eyebrow>Funciones</Eyebrow>
          <h2 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">Todo lo que necesitas para cobrar, nada que estorbe.</h2>
        </Aparece>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FUNCIONES.map((f, i) =>
          <Aparece key={f.titulo} retraso={(i % 3) * 0.08}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="group relative h-full overflow-hidden rounded-2xl border border-line bg-surface p-6">
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/0 blur-3xl transition-colors duration-500 group-hover:bg-brand/20" />
                <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-brand">
                  <f.icono size={20} aria-hidden="true" />
                </span>
                <h3 className="relative mt-5 text-lg font-semibold">{f.titulo}</h3>
                <p className="relative mt-2 text-[15px] leading-relaxed text-muted">{f.texto}</p>
              </motion.div>
            </Aparece>
          )}
        </div>
      </div>
    </section>);

}

/* ───────────── Guía con IA ───────────── */

function DemoGuia() {
  const ref = useRef<HTMLDivElement>(null);
  const enVista = useInView(ref, { once: true, margin: '-120px' });
  const [fase, setFase] = useState(0);
  useEffect(() => {
    if (!enVista) return;
    const tiempos = [400, 1600, 2800, 4000];
    const ts = tiempos.map((t, i) => setTimeout(() => setFase(i + 1), t));
    return () => ts.forEach(clearTimeout);
  }, [enVista]);

  return (
    <div ref={ref} className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/15 text-brand ring-1 ring-brand/40">
          <LifeBuoyIcon size={16} />
        </span>
        <div>
          <p className="text-sm font-semibold">Guía</p>
          <p className="text-xs text-muted">Te enseña a usar Cobrix</p>
        </div>
      </div>
      <div className="min-h-[260px] space-y-4 pt-5">
        {fase >= 1 &&
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-surface-2 px-3.5 py-2.5 text-sm">
            ¿Cómo registro una promesa de pago?
          </motion.p>
        }
        {fase >= 2 &&
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
              <LifeBuoyIcon size={12} />
            </span>
            <p className="text-sm leading-relaxed text-fg/90">
              Abre al cliente y presiona <strong className="text-fg">“Registrar promesa”</strong>. Elige el monto y la fecha que acordaron: sus recordatorios se pausan hasta ese día.
            </p>
          </motion.div>
        }
        {fase >= 3 &&
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pl-[34px]">
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/10 px-3 text-sm font-medium text-brand">
              Registrar promesa de Ferretería López <ArrowRightIcon size={14} />
            </span>
          </motion.div>
        }
      </div>
      <AnimatePresence>
        {fase >= 4 &&
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 grid place-items-center bg-black/60 p-5">
            <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-full max-w-sm">

              <motion.div className="rounded-xl bg-surface-2 p-3 ring-2 ring-brand" animate={{ boxShadow: ['0 0 0 0px rgb(var(--brand) / 0.4)', '0 0 0 10px rgb(var(--brand) / 0)'] }} transition={{ duration: 1.4, repeat: Infinity }}>
                <span className="flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface text-sm font-medium">
                  <CalendarCheckIcon size={15} /> Registrar promesa
                </span>
              </motion.div>
              <div className="mt-3 rounded-xl border border-brand/40 bg-surface p-3.5 shadow-xl">
                <p className="text-sm font-semibold">Presiona “Registrar promesa”</p>
                <p className="mt-1 text-xs text-muted">Elige monto y fecha. Así de fácil.</p>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

function Guia() {
  return (
    <section id="guia" className="scroll-mt-20 py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <Aparece>
          <Eyebrow>IA en cada paso</Eyebrow>
          <h2 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">Redacta, sugiere y te enseña. Tú decides.</h2>
          <p className="mt-5 text-[16px] leading-relaxed text-muted">
            El asistente escribe cada recordatorio según el atraso y el historial del cliente, te propone qué contestar y detecta promesas de pago. La Guía conoce cada pantalla y te lleva al botón exacto. Nada sale sin que lo revises.
          </p>
          <ul className="mt-6 space-y-3 text-[15px]">
            {['Recordatorios redactados para cada cliente', '3 respuestas sugeridas cuando te escriben', 'Detecta promesas de pago y te las deja listas', 'Resumen del día y una Guía que señala dónde presionar'].map((t) =>
            <li key={t} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                  <CheckIcon size={12} />
                </span>
                {t}
              </li>
            )}
          </ul>
        </Aparece>
        <Aparece retraso={0.1}>
          <DemoGuia />
        </Aparece>
      </div>
    </section>);

}

/* ───────────── Para desarrolladores ───────────── */

function Desarrolladores() {
  return (
    <section className="border-t border-line bg-surface/30 py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        <Aparece>
          <Eyebrow>Para desarrolladores</Eyebrow>
          <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">API documentada, de punta a punta.</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">Arquitectura, endpoints con ejemplos, streaming NDJSON, modelo de datos y despliegue con planes gratuitos.</p>
          <Link to="/docs" className="group mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-brand">
            <BookOpenIcon size={17} aria-hidden="true" /> Ver la documentación
            <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Aparece>
        <Aparece retraso={0.1}>
          <div className="overflow-hidden rounded-2xl border border-line bg-[rgb(8_9_11)] shadow-2xl shadow-black/40">
            <div className="flex h-10 items-center gap-1.5 border-b border-line/70 px-4">
              <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-ok/70" />
              <span className="ml-3 font-mono text-[11px] text-muted">POST /clientes/c01/promesa</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-[rgb(214_220_228)]">
              {`curl -X POST $API/clientes/c01/promesa \\
  -H "Authorization: Bearer $JWT" \\
  -d '{ "monto": 14250, "fecha": "2026-10-16" }'

`}
              <span className="text-brand">{`{ "promesa": { "monto": 14250, "estado": "pendiente" } }`}</span>
            </pre>
          </div>
        </Aparece>
      </div>
    </section>);

}

/* ───────────── CTA final ───────────── */

function CtaFinal() {
  const reducir = useReducedMotion();
  return (
    <section className="px-4 py-24 sm:px-6">
      <Aparece>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-brand/30 bg-surface px-6 py-16 text-center sm:px-12">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-[680px] max-w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/25 blur-[100px]"
            animate={reducir ? undefined : { opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />

          <h2 className="relative text-[30px] font-semibold leading-tight tracking-tight sm:text-[42px]">Empieza a cobrar mejor hoy.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[16px] text-muted">Tu propia cartera de ejemplo, lista en segundos. Prueba todo sin miedo: nada se envía a clientes reales.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <BotonPrimario to="/demo">Probar la demo gratis</BotonPrimario>
            <BotonSecundario to="/entrar">
              <LockIcon size={15} aria-hidden="true" /> Entrar a mi cuenta
            </BotonSecundario>
          </div>
        </div>
      </Aparece>
    </section>);

}

/* ───────────── Página ───────────── */

export function Landing() {
  useEffect(() => {
    document.title = 'Cobrix · Cobranza por WhatsApp para PyMEs';
  }, []);
  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-bg text-fg">
      <Nav />
      <main>
        <Hero />
        <Cinta />
        <ComoFunciona />
        <Funciones />
        <Guia />
        <Desarrolladores />
        <CtaFinal />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Logo compacto />
            <span>Cobranza por WhatsApp para PyMEs mexicanas</span>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/docs" className="hover:text-fg">
              Documentación
            </Link>
            <Link to="/privacidad" className="hover:text-fg">
              Privacidad
            </Link>
            <Link to="/terminos" className="hover:text-fg">
              Términos
            </Link>
            <Link to="/entrar" className="hover:text-fg">
              Entrar
            </Link>
          </nav>
        </div>
      </footer>
    </div>);

}
