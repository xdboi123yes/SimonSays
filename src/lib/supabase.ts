import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token',
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Add event listener for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token');
  }

  if (event === 'SIGNED_IN' && session) {
    // Ensure the session is properly stored
    localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  }

  // Handle token refresh errors
  if (event === 'TOKEN_REFRESHED' && !session) {
    // If token refresh failed, sign out and redirect to login
    supabase.auth.signOut().catch(console.error);
    window.location.href = '/login';
  }
});