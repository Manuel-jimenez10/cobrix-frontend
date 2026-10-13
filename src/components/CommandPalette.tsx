import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheckIcon, CornerDownLeftIcon, HouseIcon, MoonIcon, SearchIcon, SettingsIcon, SparklesIcon, UserRoundIcon, UsersIcon, BoxIcon } from "lucide-react";
import { useCobranza } from "../contexts/CobranzaContext";
import { useUI } from "../contexts/UIContext";
import { useEsEscritorio } from "../hooks/useMediaQuery";
import { cn } from "../utils/cn";
import { formatMXN, normalizar } from "../utils/format";
import { EASE_OUT, teclaMod } from "../utils/motion";
import { Kbd } from "./ui/Kbd";
interface Item {
  id: string;
  grupo: 'Acciones' | 'Clientes';
  etiqueta: string;
  detalle?: string;
  icono: typeof BoxIcon;
  atajo?: string;
  ejecutar: () => void;
}
export function CommandPalette() {
  const {
    paletaAbierta,
    setPaletaAbierta,
    abrirCobranza,
    setDirectorAbierto,
    alternarTema,
    tema
  } = useUI();
  const {
    clientes
  } = useCobranza();
  const navigate = useNavigate();
  const escritorio = useEsEscritorio();
  const [q, setQ] = useState('');
  const [indice, setIndice] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaId = useId();
  const mod = teclaMod();
  const cerrar = () => setPaletaAbierta(false);
  useEffect(() => {
    if (paletaAbierta) {
      setQ('');
      setIndice(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [paletaAbierta]);
  const items = useMemo<Item[]>(() => {
    const ir = (ruta: string) => () => navigate(ruta);
    const acciones: Item[] = [{
      id: 'a-cobranza',
      grupo: 'Acciones',
      etiqueta: 'Iniciar cobranza con IA',
      icono: SparklesIcon,
      ejecutar: () => abrirCobranza()
    }, {
      id: 'a-director',
      grupo: 'Acciones',
      etiqueta: 'Preguntar al Director',
      icono: SparklesIcon,
      atajo: `${mod}J`,
      ejecutar: () => escritorio ? setDirectorAbierto(true) : navigate('/director')
    }, {
      id: 'a-inicio',
      grupo: 'Acciones',
      etiqueta: 'Ir a Inicio',
      icono: HouseIcon,
      ejecutar: ir('/')
    }, {
      id: 'a-cartera',
      grupo: 'Acciones',
      etiqueta: 'Ir a Cartera',
      icono: UsersIcon,
      ejecutar: ir('/cartera')
    }, {
      id: 'a-promesas',
      grupo: 'Acciones',
      etiqueta: 'Ir a Promesas de pago',
      icono: CalendarCheckIcon,
      ejecutar: ir('/promesas')
    }, {
      id: 'a-ajustes',
      grupo: 'Acciones',
      etiqueta: 'Ir a Ajustes',
      icono: SettingsIcon,
      ejecutar: ir('/ajustes')
    }, {
      id: 'a-tema',
      grupo: 'Acciones',
      etiqueta: tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
      icono: MoonIcon,
      ejecutar: alternarTema
    }];
    const deClientes: Item[] = [...clientes].sort((a, b) => b.prioridad.score - a.prioridad.score).map((c) => ({
      id: c.id,
      grupo: 'Clientes',
      etiqueta: c.empresa,
      detalle: `${c.nombre} · ${formatMXN(c.deuda)}`,
      icono: UserRoundIcon,
      ejecutar: () => navigate(`/cartera/${c.id}`)
    }));
    const busqueda = normalizar(q.trim());
    if (!busqueda) return [...acciones.slice(0, 4), ...deClientes.slice(0, 5)];
    const coincide = (i: Item) => normalizar(`${i.etiqueta} ${i.detalle ?? ''}`).includes(busqueda);
    return [...deClientes.filter(coincide).slice(0, 8), ...acciones.filter(coincide)];
  }, [q, clientes, navigate, abrirCobranza, setDirectorAbierto, escritorio, alternarTema, tema, mod]);
  useEffect(() => setIndice(0), [q]);
  const ejecutar = (item: Item) => {
    cerrar();
    item.ejecutar();
  };
  const alTeclear = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndice((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndice((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && items[indice]) {
      e.preventDefault();
      ejecutar(items[indice]);
    } else if (e.key === 'Escape') {
      cerrar();
    }
  };
  const grupos = (['Clientes', 'Acciones'] as const).filter((g) => items.some((i) => i.grupo === g));
  const orden = q.trim() ? grupos : (['Acciones', 'Clientes'] as const).filter((g) => grupos.includes(g));
  return <AnimatePresence>
      {paletaAbierta && <div className="fixed inset-0 z-[60] flex justify-center px-4 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-black/55" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.15
      }} onClick={cerrar} />
          <motion.div role="dialog" aria-modal="true" aria-label="Buscar clientes y acciones" initial={{
        opacity: 0,
        scale: 0.96,
        y: -6
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.98
      }} transition={{
        duration: 0.16,
        ease: EASE_OUT
      }} className="relative h-fit w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <SearchIcon size={18} className="text-muted" aria-hidden="true" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={alTeclear} role="combobox" aria-expanded="true" aria-controls={listaId} aria-activedescendant={items[indice] ? `cmd-${items[indice].id}` : undefined} aria-label="Buscar" placeholder="Buscar clientes o acciones…" className="h-14 flex-1 bg-transparent text-[15px] placeholder:text-muted focus:outline-none" />
              <Kbd>Esc</Kbd>
            </div>
            <div id={listaId} role="listbox" className="max-h-[56vh] overflow-y-auto p-2">
              {items.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted">Sin resultados para “{q}”.</p>}
              {orden.map((g) => <div key={g} className="pb-1">
                  <p className="px-3 pb-1 pt-2 text-xs text-muted">{g}</p>
                  {items.filter((i) => i.grupo === g).map((item) => {
              const idx = items.indexOf(item);
              const activo = idx === indice;
              return <div key={item.id} id={`cmd-${item.id}`} role="option" aria-selected={activo} onMouseMove={() => setIndice(idx)} onClick={() => ejecutar(item)} className={cn('flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-3 py-2', activo ? 'bg-surface-2' : '')}>
                          <item.icono size={16} className={activo ? 'text-fg' : 'text-muted'} aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm">{item.etiqueta}</span>
                            {item.detalle && <span className="block truncate text-xs tabular-nums text-muted">{item.detalle}</span>}
                          </span>
                          {item.atajo && <Kbd>{item.atajo}</Kbd>}
                          {activo && <CornerDownLeftIcon size={14} className="text-muted" aria-hidden="true" />}
                        </div>;
            })}
                </div>)}
            </div>
          </motion.div>
        </div>}
    </AnimatePresence>;
}