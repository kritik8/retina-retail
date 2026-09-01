import { createClient } from '@supabase/supabase-js';
import type { Shop } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isConfiguredSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Initiates Google OAuth authentication flow
 */
export async function signInWithGoogle() {
  if (!isConfiguredSupabase) {
    console.warn('Supabase keys not configured in .env.local. Using demo auth redirect.');
    return { data: null, error: null };
  }

  const origin = window.location.origin;
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/dashboard/overview`,
    },
  });
}

/**
 * Checks if the current authenticated user has an onboarded shop registered
 */
export async function getUserShop(userId: string): Promise<Shop | null> {
  if (!isConfiguredSupabase) {
    // Check local storage mock session fallback
    const mockShop = localStorage.getItem('retina_mock_shop');
    return mockShop ? JSON.parse(mockShop) : null;
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user shop:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Failed to query shop table:', err);
    return null;
  }
}
