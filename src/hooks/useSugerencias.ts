import { useEffect, useState } from 'react';
import * as api from '../services/api';
import type { ResultadoSugerencias } from '../types/cobranza';

/**
 * Respuestas sugeridas (y promesa detectada) para el último mensaje del cliente.
 * Se piden de nuevo solo cuando llega un mensaje nuevo del cliente.
 */
export function useSugerencias(clienteId: string, ultimoMensajeClienteId: string | null) {
  const [datos, setDatos] = useState<ResultadoSugerencias | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setDatos(null);
    if (!ultimoMensajeClienteId) return;
    let activo = true;
    setCargando(true);
    api.
    sugerirRespuestas(clienteId).
    then((r) => activo && setDatos(r)).
    catch(() => activo && setDatos(null)).
    finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [clienteId, ultimoMensajeClienteId]);

  return { datos, cargando, descartarPromesa: () => setDatos((d) => d ? { ...d, promesa: null } : d) };
}
