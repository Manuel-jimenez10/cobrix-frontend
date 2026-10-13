import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as api from '../services/api';
import type { Perfil } from '../services/api';

interface AuthValor {
  /** null mientras se resuelve la sesión inicial. */
  listo: boolean;
  sesion: Session | null;
  perfil: Perfil | null;
  /** No se pudo contactar al backend de agentes. */
  errorPerfil: string | null;
  reintentarPerfil: () => void;
  modoDemoLocal: boolean;
  entrar: (email: string, password: string) => Promise<void>;
  registrarse: (datos: {email: string;password: string;nombre: string;empresa: string;}) => Promise<{requiereConfirmacion: boolean;}>;
  entrarComoInvitado: () => Promise<void>;
  salir: () => Promise<void>;
}

const AuthContext = createContext<AuthValor | null>(null);

const MENSAJES: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'User already registered': 'Ya existe una cuenta con ese correo.',
  'Email not confirmed': 'Confirma tu correo antes de entrar.',
  'Anonymous sign-ins are disabled': 'La demo de invitado no está habilitada en Supabase.'
};
const traducir = (e: {message: string;}) => new Error(MENSAJES[e.message] ?? e.message);

export function AuthProvider({ children }: {children: ReactNode;}) {
  const modoDemoLocal = !supabase;
  const [listo, setListo] = useState(modoDemoLocal);
  const [sesion, setSesion] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!supabase) {
      void api.getPerfil().then(setPerfil);
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setListo(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => setSesion(nueva));
    return () => data.subscription.unsubscribe();
  }, []);

  // El perfil (nombre y empresa) vive en el backend; la primera llamada también siembra la cartera demo.
  const userId = sesion?.user.id;
  useEffect(() => {
    if (!supabase) return;
    if (!userId) {
      setPerfil(null);
      return;
    }
    let activo = true;
    setErrorPerfil(null);
    void api.
    getPerfil().
    then((p) => activo && setPerfil(p)).
    catch((e: Error) => {
      if (!activo) return;
      setPerfil(null);
      setErrorPerfil(e.message === 'Failed to fetch' ? 'No pudimos conectar con el servidor de agentes.' : e.message);
    });
    return () => {
      activo = false;
    };
  }, [userId, intento]);

  const reintentarPerfil = useCallback(() => setIntento((i) => i + 1), []);

  const entrar = useCallback(async (email: string, password: string) => {
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) throw traducir(error);
  }, []);

  const registrarse = useCallback(async ({ email, password, nombre, empresa }: {email: string;password: string;nombre: string;empresa: string;}) => {
    const { data, error } = await supabase!.auth.signUp({ email, password, options: { data: { nombre, empresa } } });
    if (error) throw traducir(error);
    return { requiereConfirmacion: !data.session };
  }, []);

  const entrarComoInvitado = useCallback(async () => {
    const { error } = await supabase!.auth.signInAnonymously({ options: { data: { nombre: 'Invitado' } } });
    if (error) throw traducir(error);
  }, []);

  const salir = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const valor = useMemo<AuthValor>(
    () => ({ listo, sesion, perfil, errorPerfil, reintentarPerfil, modoDemoLocal, entrar, registrarse, entrarComoInvitado, salir }),
    [listo, sesion, perfil, errorPerfil, reintentarPerfil, modoDemoLocal, entrar, registrarse, entrarComoInvitado, salir]
  );
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValor {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
