type VariablesEntorno = Record<string, string | undefined>;

const variables: VariablesEntorno =
(import.meta as unknown as {env?: VariablesEntorno;}).env ?? {};

export const env = {
  agentsApiUrl: (variables.VITE_AGENTS_API_URL ?? '').replace(/\/$/, ''),
  supabaseUrl: variables.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: variables.VITE_SUPABASE_ANON_KEY ?? ''
};

/** Sin backend configurado, la app funciona como demo con datos en memoria. */
export const usaDatosMock = !(env.agentsApiUrl && env.supabaseUrl && env.supabaseAnonKey);
