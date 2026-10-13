import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheckIcon, HouseIcon, LifeBuoyIcon, UsersIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';

const ITEMS = [
{ to: '/', etiqueta: 'Inicio', icono: HouseIcon, end: true },
{ to: '/cartera', etiqueta: 'Cartera', icono: UsersIcon, end: false },
{ to: '/promesas', etiqueta: 'Promesas', icono: CalendarCheckIcon, end: false },
{ to: '/guia', etiqueta: 'Guía', icono: LifeBuoyIcon, end: false }];


export function BottomNav() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) =>
        <li key={item.to}>
            <NavLink to={item.to} end={item.end} data-tour={item.to === '/guia' ? 'abrir-guia' : `nav${item.to === '/' ? '-inicio' : item.to.replace('/', '-')}`} className="flex h-16 flex-col items-center justify-center gap-1">
              {({ isActive }) =>
            <>
                  <motion.span whileTap={{ scale: 0.92 }} transition={{ duration: 0.12 }} className="relative grid h-8 w-12 place-items-center rounded-full">
                    {isActive &&
                <motion.span layoutId="bottomnav-activo" className="absolute inset-0 rounded-full bg-brand/15" transition={{ duration: 0.22, ease: EASE_OUT }} />
                }
                    <item.icono size={20} className={cn('relative', isActive ? 'text-brand' : 'text-muted')} aria-hidden="true" />
                  </motion.span>
                  <span className={cn('text-[11px] font-medium', isActive ? 'text-fg' : 'text-muted')}>{item.etiqueta}</span>
                </>
            }
            </NavLink>
          </li>
        )}
      </ul>
    </nav>);

}