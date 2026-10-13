import { useCallback, useEffect, useRef, useState } from 'react';
import { useCobranza } from '../contexts/CobranzaContext';
import * as api from '../services/api';
import type { ClienteDetalle } from '../types/cobranza';

export function useClienteDetalle(id: string) {
  const { version } = useCobranza();
  const [detalle, setDetalle] = useState<ClienteDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const idActual = useRef(id);
  const versionPrevia = useRef(version);

  const cargar = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCargando(true);
      try {
        const d = await api.getCliente(id);
        if (idActual.current === id) {
          setDetalle(d);
          setError(false);
        }
      } catch {
        if (idActual.current === id) setError(true);
      } finally {
        if (idActual.current === id) setCargando(false);
      }
    },
    [id]
  );

  useEffect(() => {
    idActual.current = id;
    setDetalle(null);
    void cargar();
  }, [id, cargar]);

  useEffect(() => {
    if (versionPrevia.current !== version) {
      versionPrevia.current = version;
      void cargar(true);
    }
  }, [version, cargar]);

  // Mensajes que llegan por fuera de la app (p. ej. respuestas por WhatsApp): recarga silenciosa.
  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout> | null = null;
    const cancelar = api.suscribirMensajes(id, () => {
      if (temporizador) clearTimeout(temporizador);
      temporizador = setTimeout(() => void cargar(true), 900);
    });
    return () => {
      if (temporizador) clearTimeout(temporizador);
      cancelar();
    };
  }, [id, cargar]);

  const actualizar = useCallback((fn: (d: ClienteDetalle) => ClienteDetalle) => {
    setDetalle((d) => d ? fn(d) : d);
  }, []);

  const recargar = useCallback(() => cargar(true), [cargar]);

  return { detalle, cargando, error, actualizar, recargar, reintentar: () => cargar() };
}