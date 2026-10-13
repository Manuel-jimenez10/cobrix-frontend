import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarCheckIcon,
  HouseIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  UsersIcon } from
'lucide-react';
import { useCobranza } from '../../contexts/CobranzaContext';
import { useGuia } from '../../contexts/GuiaContext';
import { GuiaAvatar } from '../guia/GuiaAvatar';
import { useUI } from '../../contexts/UIContext';
import { cn } from '../../utils/cn';
import { grupoDePromesa } from '../../utils/cobranza';
import { EASE_OUT, teclaMod } from '../../utils/motion';
import { Kbd } from '../ui/Kbd';
import { Logo } from './Logo';

const NAV = [
{ to: '/', etiqueta: 'Inicio', icono: HouseIcon, end: true },
{ to: '/cartera', etiqueta: 'Cartera', icono: UsersIcon, end: false },
{ to: '/promesas', etiqueta: 'Promesas', icono: CalendarCheckIcon, end: false },
{ to: '/ajustes', etiqueta: 'Ajustes', icono: SettingsIcon, end: false }];


export function Sidebar() {
  const { sidebarColapsado: col, alternarSidebar, setPaletaAbierta, tema, alternarTema } = useUI();
  const { promesas, clientes } = useCobranza();
  const guia = useGuia();
  const porAtender = clientes.filter((c) => c.requiereAtencion).length;
  const vencidas = promesas.filter((p) => grupoDePromesa(p) === 'vencidas').length;
  const mod = teclaMod();
  const fila = 'relative flex h-10 w-full items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors duration-150';

  return (
    <motion.aside
      initial={false}
      animate={{ width: col ? 72 : 240 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r border-line bg-surface/50">
      
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo compacto={col} />
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => setPaletaAbierta(true)}
          aria-label="Buscar clientes y acciones"
          title={col ? `Buscar (${mod}K)` : undefined}
          className={cn(fila, 'h-9 border border-line bg-surface-2/60 text-muted hover:text-fg')}>
          
          <SearchIcon size={16} className="shrink-0" aria-hidden="true" />
          {!col &&
          <>
              <span className="flex-1 text-left font-normal">Buscar…</span>
              <Kbd>{mod}K</Kbd>
            </>
          }
        </button>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 px-3">
        <ul className="space-y-0.5">
          {NAV.map((item) =>
          <li key={item.to}>
              <NavLink
              to={item.to}
              end={item.end}
              data-tour={`nav${item.to === '/' ? '-inicio' : item.to.replace('/', '-')}`}
              title={col ? item.etiqueta : undefined}
              className={({ isActive }) => cn(fila, isActive ? 'text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg')}>
              
                {({ isActive }) =>
              <>
                    {isActive &&
                <motion.span
                  layoutId="sidebar-activo"
                  className="absolute inset-0 rounded-lg border border-line bg-surface-2"
                  transition={{ duration: 0.2, ease: EASE_OUT }} />

                }
                    <item.icono size={17} className="relative shrink-0" aria-hidden="true" />
                    {!col && <span className="relative flex-1 truncate">{item.etiqueta}</span>}
                    {item.to === '/cartera' && porAtender > 0 &&
                <span
                  className={cn('relative grid h-5 min-w-5 place-items-center rounded-full bg-warn/15 px-1.5 text-[11px] font-semibold tabular-nums text-warn', col && 'absolute right-1 top-1 h-4 min-w-4 px-1 text-[10px]')}
                  aria-label={`${porAtender} clientes esperan tu respuesta`}
                  title="Esperan tu respuesta">

                        {porAtender}
                      </span>
                }
                    {item.to === '/promesas' && vencidas > 0 &&
                <span
                  className={cn('relative grid h-5 min-w-5 place-items-center rounded-full bg-bad/15 px-1.5 text-[11px] font-semibold tabular-nums text-bad', col && 'absolute right-1 top-1 h-4 min-w-4 px-1 text-[10px]')}
                  aria-label={`${vencidas} promesas vencidas`}>
                  
                        {vencidas}
                      </span>
                }
                  </>
              }
              </NavLink>
            </li>
          )}
        </ul>

        <div className="mx-1 my-4 h-px bg-line" />

        <button
          type="button"
          onClick={() => guia.setAbierto((v) => !v)}
          data-tour="nav-guia"
          aria-pressed={guia.abierto}
          title={col ? `Guía (${mod}J)` : undefined}
          className={cn(fila, guia.abierto ? 'bg-surface-2 text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg')}>

          <GuiaAvatar tamano="sm" className="-ml-0.5" />
          {!col &&
          <>
              <span className="flex-1 text-left">Guía</span>
              <Kbd>{mod}J</Kbd>
            </>
          }
        </button>
      </nav>

      <div className="space-y-0.5 border-t border-line p-3">
        <button type="button" onClick={alternarTema} className={cn(fila, 'text-muted hover:bg-surface-2 hover:text-fg')} title={col ? 'Cambiar tema' : undefined}>
          {tema === 'oscuro' ? <SunIcon size={17} className="shrink-0" aria-hidden="true" /> : <MoonIcon size={17} className="shrink-0" aria-hidden="true" />}
          {col ? <span className="sr-only">Cambiar tema</span> : <span>{tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}</span>}
        </button>
        <button type="button" onClick={alternarSidebar} className={cn(fila, 'text-muted hover:bg-surface-2 hover:text-fg')} aria-label={col ? 'Expandir barra lateral' : 'Colapsar barra lateral'}>
          {col ? <PanelLeftOpenIcon size={17} className="shrink-0" aria-hidden="true" /> : <PanelLeftCloseIcon size={17} className="shrink-0" aria-hidden="true" />}
          {!col && <span>Colapsar</span>}
        </button>
      </div>
    </motion.aside>);

}