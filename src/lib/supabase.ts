/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const env = (import.meta as any).env || {};
const rawUrl = env.VITE_SUPABASE_URL;
const rawKey = env.VITE_SUPABASE_ANON_KEY;

const isValidHttpUrl = (str: any): boolean => {
  if (!str || typeof str !== 'string') return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  isValidHttpUrl(rawUrl) &&
  !rawUrl.includes('your-project') &&
  !rawKey.includes('placeholder')
);

// Valid fallback HTTP URL so createClient never throws "Invalid supabaseUrl"
const fallbackUrl = 'https://daim-post-shakh.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoYWtoLWRhaW0tcG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.placeholderKey';

const supabaseUrl = isValidHttpUrl(rawUrl) ? rawUrl : fallbackUrl;
const supabaseAnonKey = (rawKey && typeof rawKey === 'string') ? rawKey : fallbackKey;

let supabaseClient: any;
try {
  supabaseClient = createClient<any>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
} catch (err) {
  console.warn('Supabase initialization failed, falling back to safe placeholder:', err);
  supabaseClient = createClient<any>(fallbackUrl, fallbackKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export const supabase = supabaseClient;


