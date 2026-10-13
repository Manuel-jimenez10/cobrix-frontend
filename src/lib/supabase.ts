import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, usaDatosMock } from '../utils/env';

/**
 * Cliente público de Supabase (anon key): solo autentica y escucha Realtime.
 * RLS garantiza que cada usuario lea únicamente sus filas.
 */
export const supabase: SupabaseClient | null = usaDatosMock ?
null :
createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
