import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isDemo } from '@/lib/config';
import { DEMO_USER_ID } from '@/services/demo';
import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  enterDemo: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (isDemo) {
      AsyncStorage.getItem('chatroom:demo-session')
        .then((value) => {
          if (value) setSession(demoSession);
        })
        .catch(() => {
          console.warn('[Sessão] Não foi possível restaurar a demonstração.');
        })
        .finally(() => setLoading(false));
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .catch(() => {
        console.warn('[Sessão] Não foi possível restaurar a sessão.');
      })
      .finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) queryClient.clear(); // não vazar dados entre contas
    });
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    if (Platform.OS !== 'web' && AppState.currentState === 'active')
      supabase.auth.startAutoRefresh();
    return () => {
      data.subscription.unsubscribe();
      listener.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);
  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      enterDemo: async () => {
        if (!isDemo)
          throw new Error('Demonstração disponível apenas sem Supabase configurado.');
        await AsyncStorage.setItem('chatroom:demo-session', 'true');
        setSession(demoSession);
      },
      signIn: async (email, password) => {
        if (isDemo)
          throw new Error(
            'Configure o Supabase para entrar com sua conta, ou use a demonstração.',
          );
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async (name, email, password) => {
        if (isDemo)
          throw new Error(
            'Configure o Supabase para criar sua conta. A demonstração está disponível na tela de entrada.',
          );
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        return { needsConfirmation: data.session === null };
      },
      signOut: async () => {
        if (isDemo) {
          await AsyncStorage.removeItem('chatroom:demo-session');
          setSession(null);
          queryClient.clear();
          return;
        }
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [session, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return context;
}

const demoSession = {
  user: { id: DEMO_USER_ID, email: 'visitante@demo.local' },
} as Session;
