import React, { useEffect } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { useUI } from '../../contexts/UIContext';
import { useEsEscritorio } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { CobranzaLauncher } from '../cartera/CobranzaLauncher';
import { CommandPalette } from '../CommandPalette';
import { Tutorial } from '../tutorial/Tutorial';
import { DirectorPanel } from '../director/DirectorPanel';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const escritorio = useEsEscritorio();
  const { sidebarColapsado, tema, setPaletaAbierta, setDirectorAbierto } = useUI();
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const esDetalleMovil = !escritorio && /^\/cartera\/[^/]+/.test(location.pathname);
  const clave = escritorio ? location.pathname.split('/')[1] || 'inicio' : location.pathname;

  useEffect(() => {
    if (!escritorio) window.scrollTo(0, 0);
  }, [location.pathname, escritorio]);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const tecla = e.key.toLowerCase();
      if (tecla === 'k') {
        e.preventDefault();
        setPaletaAbierta((v) => !v);
      } else if (tecla === 'j') {
        e.preventDefault();
        if (escritorio) setDirectorAbierto((v) => !v);else
        navigate('/director');
      }
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [escritorio, navigate, setPaletaAbierta, setDirectorAbierto]);

  return (
    <div className="min-h-[100dvh] w-full bg-bg text-fg">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      {escritorio && <Sidebar />}
      <main id="contenido" className={cn('transition-[padding] duration-200 ease-out', escritorio && (sidebarColapsado ? 'pl-[72px]' : 'pl-60'))}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={clave}
            initial={esDetalleMovil ? { opacity: 0, x: 24 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.22, ease: EASE_OUT }}>
            
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      {!escritorio && !esDetalleMovil && <BottomNav />}
      {escritorio && <DirectorPanel />}
      <Tutorial />
      <CommandPalette />
      <CobranzaLauncher />
      <Toaster
        theme={tema === 'oscuro' ? 'dark' : 'light'}
        position={escritorio ? 'bottom-right' : 'top-center'}
        offset={escritorio ? 24 : 'calc(env(safe-area-inset-top) + 12px)'}
        toastOptions={{
          style: {
            background: 'rgb(var(--surface-2))',
            color: 'rgb(var(--fg))',
            border: '1px solid rgb(var(--line))',
            fontFamily: 'Geist, Inter Tight, system-ui, sans-serif'
          }
        }} />
      
    </div>);

}