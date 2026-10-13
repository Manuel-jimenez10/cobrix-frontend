import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, LifeBuoyIcon, ListOrderedIcon, LoaderCircleIcon, MessageCircleIcon, SendIcon, SparklesIcon } from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { Landing } from './Landing';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';
import { EASE_OUT } from '../utils/motion';

const FUNCIONES = [
{ icono: ListOrderedIcon, titulo: 'Prioriza tu cartera', texto: 'Sabes a quién cobrar primero y por qué' },
{ icono: SendIcon, titulo: 'Recordatorios por WhatsApp', texto: 'Plantillas aprobadas: amable, firme y aviso final' },
{ icono: MessageCircleIcon, titulo: 'Tú cierras el acuerdo', texto: 'Te avisa cuando un cliente responde' },
{ icono: LifeBuoyIcon, titulo: 'Guía con IA', texto: 'Te enseña a usar la app y señala dónde presionar' }];

function Campo({ id, etiqueta, children }: {id: string;etiqueta: string;children: ReactNode;}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {etiqueta}
      </label>
      {children}
    </div>);

}

const claseInput =
'h-12 w-full rounded-lg border border-line bg-surface-2 px-3.5 text-[15px] outline-none transition-colors placeholder:text-muted/70 focus:border-brand/70 focus:ring-2 focus:ring-brand/20 lg:h-11 lg:text-sm';

function Formulario() {
  const { entrar, registrarse, entrarComoInvitado, entrarConGoogle } = useAuth();
  const [modo, setModo] = useState<'entrar' | 'registro'>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [enviando, setEnviando] = useState<'form' | 'invitado' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setEnviando('form');
    try {
      if (modo === 'entrar') {
        await entrar(email.trim(), password);
      } else {
        const r = await registrarse({ email: email.trim(), password, nombre: nombre.trim(), empresa: empresa.trim() });
        if (r.requiereConfirmacion) setAviso('Te enviamos un correo para confirmar tu cuenta. Después vuelve aquí para entrar.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(null);
    }
  };

  const invitado = async () => {
    setError(null);
    setEnviando('invitado');
    try {
      await entrarComoInvitado();
    } catch (err) {
      setError((err as Error).message);
      setEnviando(null);
    }
  };

  const google = async () => {
    setError(null);
    setEnviando('google');
    try {
      await entrarConGoogle(); // redirige a Google y vuelve con la sesión iniciada
    } catch (err) {
      setError((err as Error).message);
      setEnviando(null);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="text-[28px] font-semibold tracking-tight">{modo === 'entrar' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</h1>
      <p className="mt-1.5 text-sm text-muted">
        {modo === 'entrar' ? 'Entra para gestionar tus cobros.' : 'Te preparamos una cartera de ejemplo para que pruebes todo.'}
      </p>

      <motion.button
        type="button"
        onClick={() => void invitado()}
        disabled={enviando !== null}
        whileTap={{ scale: 0.98 }}
        className="group mt-7 flex w-full items-center gap-3 rounded-xl border border-brand/40 bg-brand/[0.07] p-4 text-left transition-colors hover:bg-brand/[0.11] disabled:opacity-60">

        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand text-on-brand">
          {enviando === 'invitado' ? <LoaderCircleIcon size={18} className="animate-spin" aria-hidden="true" /> : <SparklesIcon size={18} aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">Probar la demo sin registrarme</span>
          <span className="mt-0.5 block text-xs text-muted">Tu propia cartera de ejemplo, privada y lista en segundos.</span>
        </span>
        <ArrowRightIcon size={16} className="shrink-0 text-brand transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </motion.button>

      <button
        type="button"
        onClick={() => void google()}
        disabled={enviando !== null}
        className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface-2 text-[15px] font-medium transition-colors hover:bg-line/60 disabled:opacity-60 lg:h-11 lg:text-sm">

        {enviando === 'google' ?
        <LoaderCircleIcon size={18} className="animate-spin" aria-hidden="true" /> :

        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
        }
        Continuar con Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />o con tu correo<span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={(e) => void enviar(e)} className="space-y-4" noValidate>
        <AnimatePresence initial={false}>
          {modo === 'registro' &&
          <motion.div
            key="extra"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2">

              <Campo id="nombre" etiqueta="Tu nombre">
                <input id="nombre" required autoComplete="given-name" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Manuel" className={claseInput} />
              </Campo>
              <Campo id="empresa" etiqueta="Empresa">
                <input id="empresa" required autoComplete="organization" value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Distribuidora del Valle" className={claseInput} />
              </Campo>
            </motion.div>
          }
        </AnimatePresence>
        <Campo id="email" etiqueta="Correo">
          <input id="email" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.mx" className={claseInput} />
        </Campo>
        <Campo id="password" etiqueta="Contraseña">
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className={claseInput} />

        </Campo>

        <AnimatePresence>
          {(error || aviso) &&
          <motion.p
            role={error ? 'alert' : 'status'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn('rounded-lg px-3 py-2.5 text-sm', error ? 'bg-bad/10 text-bad' : 'bg-promise/10 text-promise')}>

              {error ?? aviso}
            </motion.p>
          }
        </AnimatePresence>

        <Button
          type="submit"
          variante="primario"
          tamano="lg"
          className="w-full"
          disabled={enviando !== null || !email || password.length < 6 || modo === 'registro' && (!nombre.trim() || !empresa.trim())}>

          {enviando === 'form' && <LoaderCircleIcon size={16} className="animate-spin" aria-hidden="true" />}
          {modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {modo === 'entrar' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
        <button
          type="button"
          onClick={() => {
            setModo(modo === 'entrar' ? 'registro' : 'entrar');
            setError(null);
            setAviso(null);
          }}
          className="rounded font-medium text-fg underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">

          {modo === 'entrar' ? 'Regístrate' : 'Entra'}
        </button>
      </p>
      <p className="mt-8 text-center text-xs text-muted">
        Al continuar aceptas los{' '}
        <Link to="/terminos" className="underline underline-offset-2 hover:text-fg">
          Términos de uso
        </Link>{' '}
        y el{' '}
        <Link to="/privacidad" className="underline underline-offset-2 hover:text-fg">
          Aviso de privacidad
        </Link>
        .
      </p>
    </div>);

}

function Escaparate() {
  return (
    <div className="relative hidden overflow-hidden border-r border-line bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgb(var(--line))_1px,transparent_1px)] [background-size:22px_22px]" />
      <Link to="/" className="relative self-start" aria-label="Volver al inicio">
        <Logo />
      </Link>
      <div className="relative max-w-md">
        <p className="text-[34px] font-semibold leading-[1.1] tracking-tight">
          Los recordatorios, en automático.
          <br />
          <span className="text-brand">La relación, en tus manos.</span>
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Cobrix ordena a quién cobrar primero y envía los recordatorios por WhatsApp. Cuando un cliente responde, te avisa para que tú cierres el acuerdo.
        </p>
        <ul className="mt-9 space-y-3">
          {FUNCIONES.map((f, i) =>
          <motion.li
            key={f.titulo}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: EASE_OUT }}
            className="flex items-center gap-3 rounded-xl border border-line bg-bg/50 px-4 py-3">

              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/15 text-brand" aria-hidden="true">
                <f.icono size={15} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{f.titulo}</span>
                <span className="block text-xs text-muted">{f.texto}</span>
              </span>
            </motion.li>
          )}
        </ul>
      </div>
      <p className="relative text-xs text-muted">Vercel AI SDK · Gemini · Supabase · WhatsApp Cloud API</p>
    </div>);

}

function Pantalla({ children }: {children: ReactNode;}) {
  return <div className="grid min-h-[100dvh] place-items-center bg-bg px-4">{children}</div>;
}

export function Cargando() {
  return (
    <Pantalla>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-col items-center gap-4" aria-busy="true">
        <Logo />
        <LoaderCircleIcon size={18} className="animate-spin text-muted" aria-label="Cargando" />
      </motion.div>
    </Pantalla>);

}

export function Acceso() {
  return (
    <div className="grid min-h-[100dvh] bg-bg lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Escaparate />
      <main className="flex flex-col px-5 pb-[calc(32px+env(safe-area-inset-bottom))] pt-[calc(28px+env(safe-area-inset-top))] lg:items-center lg:justify-center lg:p-12">
        <Link to="/" className="mb-10 self-start lg:hidden" aria-label="Volver al inicio">
          <Logo />
        </Link>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE_OUT }} className="flex w-full justify-center">
          <Formulario />
        </motion.div>
      </main>
    </div>);

}

/** Decide qué mostrar según la sesión: login, carga o la app. */
export function AuthGate({ children }: {children: ReactNode;}) {
  const { listo, sesion, perfil, errorPerfil, reintentarPerfil, modoDemoLocal, salir, entrarComoInvitado } = useAuth();
  const { pathname } = useLocation();
  const [errorDemo, setErrorDemo] = useState<string | null>(null);
  const intentado = useRef(false);

  // Link directo /demo: entra como invitado sin pasar por el login.
  const esLinkDemo = pathname === '/demo';
  useEffect(() => {
    if (modoDemoLocal || !listo || sesion || !esLinkDemo || intentado.current) return;
    intentado.current = true;
    entrarComoInvitado().catch((e: Error) => setErrorDemo(e.message));
  }, [modoDemoLocal, listo, sesion, esLinkDemo, entrarComoInvitado]);

  if (modoDemoLocal) return <>{children}</>;
  if (!listo) return <Cargando />;
  if (!sesion && esLinkDemo && !errorDemo) return <Cargando />;
  // Sin sesión: /entrar muestra el login; cualquier otra ruta, la landing.
  if (!sesion) return pathname === '/entrar' ? <Acceso /> : <Landing />;
  if (errorPerfil) {
    return (
      <EmptyState
        ilustracion="error"
        titulo="No pudimos conectar con el servidor"
        descripcion={`${errorPerfil} Si el servidor estaba dormido (plan gratuito de Render), tarda unos 30 segundos en despertar.`}
        accion={
        <div className="flex flex-wrap justify-center gap-2">
            <Button variante="primario" onClick={reintentarPerfil}>
              Reintentar
            </Button>
            <Button variante="fantasma" onClick={() => void salir()}>
              Cerrar sesión
            </Button>
          </div>
        }
        className="min-h-[100dvh]" />);


  }
  if (!perfil) return <Cargando />;
  return <>{children}</>;
}
