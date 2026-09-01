import React, { createContext, useEffect, useState } from 'react';
import type { UserSession, Shop, Profile } from '@/types';
import { supabase, getUserShop, isConfiguredSupabase } from '@/lib/supabase';

export interface AuthContextType extends UserSession {
  loginWithGoogle: () => Promise<void>;
  demoLogin: () => void;
  logout: () => Promise<void>;
  refreshShop: () => Promise<Shop | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession['user']>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async (userId: string) => {
    const userShop = await getUserShop(userId);
    setShop(userShop);
  };

  useEffect(() => {
    if (!isConfiguredSupabase) {
      // Check local storage mock user
      const storedUser = localStorage.getItem('retina_mock_user');
      const storedShop = localStorage.getItem('retina_mock_shop');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (storedShop) setShop(JSON.parse(storedShop));
      }
      setIsLoading(false);
      return;
    }

    // Supabase Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        });
        loadUserData(session.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        });
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setShop(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    if (!isConfiguredSupabase) {
      demoLogin();
      return;
    }
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/dashboard/overview`,
      },
    });
  };

  const demoLogin = () => {
    const mockUser = {
      id: 'demo-user-123',
      email: 'owner@retinaretail.com',
      user_metadata: {
        full_name: 'Store Owner',
        name: 'Store Owner',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
    };
    localStorage.setItem('retina_mock_user', JSON.stringify(mockUser));
    setUser(mockUser);

    const storedShop = localStorage.getItem('retina_mock_shop');
    if (storedShop) {
      setShop(JSON.parse(storedShop));
    }
  };

  const logout = async () => {
    if (isConfiguredSupabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('retina_mock_user');
    localStorage.removeItem('retina_mock_shop');
    setUser(null);
    setProfile(null);
    setShop(null);
  };

  const refreshShop = async (): Promise<Shop | null> => {
    if (user?.id) {
      const updatedShop = await getUserShop(user.id);
      setShop(updatedShop);
      return updatedShop;
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        shop,
        isLoading,
        loginWithGoogle,
        demoLogin,
        logout,
        refreshShop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
