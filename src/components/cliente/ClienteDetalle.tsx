import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCobranza } from '../../contexts/CobranzaContext';
import { useClienteDetalle } from '../../hooks/useClienteDetalle';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { ConfirmarPagoDialog } from '../cartera/ConfirmarPagoDialog';
import { MobileHeader } from '../layout/MobileHeader';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { ClienteEncabezado } from './ClienteEncabezado';
import { Conversacion } from './Conversacion';
import { FacturasList } from './FacturasList';
import { PromesasCliente } from './PromesasCliente';
import { RazonAnalista } from './RazonAnalista';
import { RegistrarPromesaDialog } from './RegistrarPromesaDialog';

type Pestana = 'conversacion' | 'detalle';

interface ClienteDetalleProps {
  id: string;
  modo: 'panel' | 'pantalla';
}

function DetalleSkeleton() {
  return (
    <div className="space-y-6 p-6" aria-busy="true" aria-label="Cargando cliente">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-10 w-72" />
      <div className="space-y-3 pt-4">
        <Skeleton className="ml-auto h-16 w-2/3 rounded-2xl" />
        <Skeleton className="h-12 w-1/2 rounded-2xl" />
        <Skeleton className="ml-auto h-20 w-3/4 rounded-2xl" />
      </div>
    </div>);

}

export function ClienteDetalle({ id, modo }: ClienteDetalleProps) {
  const { detalle, cargando, error, actualizar, recargar, reintentar } = useClienteDetalle(id);
  const { refrescarSilencioso } = useCobranza();
  const anchoXL = useMediaQuery('(min-width: 1280px)');
  const [pestana, setPestana] = useState<Pestana>('conversacion');
  const [pagoAbierto, setPagoAbierto] = useState(false);
  const [promesaAbierta, setPromesaAbierta] = useState(false);
  const navigate = useNavigate();
  const volver = () => navigate('/cartera');
  const ladoALado = modo === 'panel' && anchoXL;

  const cabeceraMovil = modo === 'pantalla' && <MobileHeader titulo={detalle?.cliente.empresa ?? 'Cliente'} onVolver={volver} colapsable={false} />;

  if (cargando && !detalle) {
    return (
      <div className="flex h-full flex-col">
        {cabeceraMovil}
        <DetalleSkeleton />
      </div>);

  }

  if (!detalle) {
    return (
      <div className="flex h-full flex-col">
        {cabeceraMovil}
        <EmptyState
          ilustracion="error"
          titulo={error ? 'No pudimos cargar al cliente' : 'Cliente no encontrado'}
          descripcion={error ? 'Revisa tu conexión e intenta de nuevo.' : 'Es posible que se haya eliminado de la cartera.'}
          accion={error ? <Button onClick={reintentar}>Reintentar</Button> : <Button onClick={volver}>Volver a la cartera</Button>}
          className="flex-1" />
        
      </div>);

  }

  const panelDetalle =
  <div className="space-y-7 px-4 py-5 lg:px-6">
      <RazonAnalista prioridad={detalle.cliente.prioridad} />
      <FacturasList facturas={detalle.facturas} />
      <PromesasCliente promesas={detalle.promesas} />
    </div>;


  return (
    <div className="flex h-full min-h-0 flex-col">
      {cabeceraMovil}
      <ClienteEncabezado detalle={detalle} modo={modo} onMarcarPagada={() => setPagoAbierto(true)} onRegistrarPromesa={() => setPromesaAbierta(true)} />

      {!ladoALado &&
      <div role="tablist" aria-label="Secciones del cliente" className="flex gap-1 border-b border-line px-4 lg:px-6">
          {(
        [
        { clave: 'conversacion', etiqueta: 'Conversación' },
        { clave: 'detalle', etiqueta: 'Facturas y análisis' }] as
        const).
        map((t) =>
        <button
          key={t.clave}
          role="tab"
          type="button"
          aria-selected={pestana === t.clave}
          onClick={() => setPestana(t.clave)}
          className={cn('relative h-11 px-3 text-sm font-medium transition-colors duration-150', pestana === t.clave ? 'text-fg' : 'text-muted hover:text-fg')}>
          
              {t.etiqueta}
              {pestana === t.clave && <motion.span layoutId={`pestana-${modo}`} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" transition={{ duration: 0.2, ease: EASE_OUT }} />}
            </button>
        )}
        </div>
      }

      <div className={cn('min-h-0 flex-1', ladoALado && 'grid grid-cols-[minmax(0,1fr)_340px]')}>
        {(ladoALado || pestana === 'conversacion') && <Conversacion detalle={detalle} actualizar={actualizar} recargar={recargar} />}
        {(ladoALado || pestana === 'detalle') && <aside className={cn('h-full overflow-y-auto', ladoALado && 'border-l border-line')}>{panelDetalle}</aside>}
      </div>

      <ConfirmarPagoDialog clienteId={pagoAbierto ? detalle.cliente.id : null} onCerrar={() => setPagoAbierto(false)} />
      <RegistrarPromesaDialog
        cliente={promesaAbierta ? detalle.cliente : null}
        onCerrar={() => setPromesaAbierta(false)}
        onRegistrada={() => {
          void recargar();
          void refrescarSilencioso();
        }} />
    </div>);

}