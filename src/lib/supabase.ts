import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton para o cliente client-side
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  // Se já existe uma instância, retorna ela
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isServer = typeof window === 'undefined';

  if (!supabaseUrl) {
    console.error('❌ URL do Supabase não encontrada nas variáveis de ambiente');
    throw new Error('Variáveis do Supabase não configuradas');
  }

  // Debug seguro para verificar se as chaves estão sendo carregadas
  if (typeof window !== 'undefined') {
    console.log('🔍 Supabase Client Debug:', {
      url: supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      anonKeyStart: supabaseAnonKey?.substring(0, 10) + '...',
      isServer: false
    });
  }

  if (supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });
    return supabaseInstance;
  }

  if (isServer && supabaseServiceRoleKey) {
    // No servidor com service role, não usamos singleton para evitar compartilhar estado entre requests se não quisermos
    // Mas se for só para storage/admin, pode ser ok. Porém, por segurança, service role costuma ser criado sob demanda ou em escopo seguro.
    // Como esta função é getSupabaseClient (que deveria ser client-side ou anon), vamos manter o comportamento de criar novo se cair aqui,
    // mas idealmente service role deve usar getSupabaseServerClient.
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });
  }

  throw new Error('Variáveis do Supabase não configuradas');
};

export const getSupabaseServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Variáveis do Supabase não configuradas');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false }
  });
};
