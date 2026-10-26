import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export function createPublicPropertyClient() {
  // Prefer runtime env (Cloudflare Worker secrets); fall back to build-time VITE_*
  // values so a missing/unset runtime var doesn't 500 the whole homepage.
  const url = import.meta.env['VITE_SUPABASE_URL'] || process.env['SUPABASE_URL'];
  const key = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] || process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Property service unavailable');
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
}