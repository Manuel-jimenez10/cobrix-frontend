import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGroup } from 'framer-motion';
import { MobileHeader } from '../components/layout/MobileHeader';
import { PromesaItem } from '../components/promesas/PromesaItem';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Money } from '../components/ui/Money';
import { Skeleton } from '../components/ui/Skeleton';
import { useCobranza } from '../contexts/CobranzaContext';
import { useEsEscritorio } from '../hooks/useMediaQuery';
import { cn } from '../utils/cn';
import { GRUPOS_PROMESA, grupoDePromesa } from '../utils/cobranza';

const COLOR_GRUPO: Record<string, string> = {
  vencidas: 'text-bad',
  hoy: 'text-warn',
  semana: 'text-promise',
  proximas: 'text-muted',
  cumplidas: 'text-ok'
};

export function Promesas() {
  const { promesas, cargando } = useCobranza();
  const escritorio = useEsEscritorio();
  const navigate = useNavigate();

  const activas = promesas.filter((p) => p.estado !== 'cumplida');
  const totalActivo = activas.reduce((s, p) => s + p.monto, 0);
  const grupos = GRUPOS_PROMESA.map((g) => ({ ...g, items: promesas.filter((p) => grupoDePromesa(p) === g.clave) })).filter((g) => g.items.length > 0);
  const suma = (clave: string) => promesas.filter((p) => grupoDePromesa(p) === clave).reduce((s, p) => s + p.monto, 0);

  const resumen =
  <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
      {[
    { clave: 'vencidas', etiqueta: 'Vencidas' },
    { clave: 'hoy', etiqueta: 'Hoy' },
    { clave: 'semana', etiqueta: 'Esta semana' }].
    map((s) =>
    <div key={s.clave} className="bg-surface p-4">
          <p className={cn('text-xs font-medium', COLOR_GRUPO[s.clave])}>{s.etiqueta}</p>
          <Money valor={suma(s.clave)} className="mt-1 block text-base font-semibold lg:text-lg" />
        </div>
    )}
    </div>;


  const cuerpo = cargando ?
  <div className="space-y-3">
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div> :
  promesas.length === 0 ?
  <EmptyState
    ilustracion="promesas"
    titulo="Aún no hay promesas de pago"
    descripcion="Cuando acuerdes una fecha con un cliente, regístrala desde su ficha con “Registrar promesa” y aparecerá aquí."
    accion={
    <Button variante="secundario" onClick={() => navigate('/cartera')}>
          Ir a la cartera
        </Button>
    } /> :


  <div className="space-y-8">
      {resumen}
      <LayoutGroup>
        {grupos.map((g) =>
      <section key={g.clave} aria-labelledby={`grupo-${g.clave}`}>
            <header className="mb-2 flex items-baseline justify-between px-1">
              <h2 id={`grupo-${g.clave}`} className={cn('text-sm font-medium', COLOR_GRUPO[g.clave])}>
                {g.titulo} <span className="font-normal text-muted">· {g.items.length}</span>
              </h2>
              <Money valor={g.items.reduce((s, p) => s + p.monto, 0)} className="text-sm text-muted" />
            </header>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
              {g.items.map((p) =>
          <PromesaItem key={p.id} promesa={p} grupo={g.clave} />
          )}
            </ul>
          </section>
      )}
      </LayoutGroup>
    </div>;


  if (escritorio) {
    return (
      <div className="px-8 py-8 xl:px-10">
        <div className="mx-auto max-w-4xl">
          <header className="mb-8">
            <h1 className="text-[28px] font-semibold tracking-tight">Promesas de pago</h1>
            <p className="mt-1.5 text-[15px] text-muted">
              Esperas <Money valor={totalActivo} moneda className="font-semibold text-fg" /> en {activas.length} promesas activas.
            </p>
          </header>
          {cuerpo}
        </div>
      </div>);

  }

  return (
    <div className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      <MobileHeader
        titulo="Promesas"
        subtitulo={
        <>
            Esperas <Money valor={totalActivo} className="font-semibold text-fg" /> en {activas.length} promesas
          </>
        } />
      
      <div className="px-4">{cuerpo}</div>
    </div>);

}