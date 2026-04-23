import { create } from 'zustand';
import { supabase, Profile } from './supabase';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setSession: (session: any) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  setSession: async (session) => {
    try {
      if (!session) {
        set({ user: null, profile: null, loading: false });
        return;
      }

      const { user } = session;
      
      // Mengambil profil dengan timeout sederhana atau handle error jika tabel tidak ada
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Profile not found or error:', error.message);
        // Tetap izinkan masuk sebagai siswa standar jika profil tidak ditemukan
        set({ 
          user, 
          profile: { id: user.id, name: user.email?.split('@')[0] || 'User', role: 'siswa', created_at: '' }, 
          loading: false 
        });
      } else {
        set({ user, profile, loading: false });
      }
    } catch (err) {
      console.error('Session Error:', err);
      set({ loading: false });
    }
  },

  initialize: async () => {
    try {
      if (get().initialized) return;

      // Ambil session saat ini
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      await get().setSession(session);

      // Listen perubahan auth
      supabase.auth.onAuthStateChange(async (_event, session) => {
        await get().setSession(session);
      });

    } catch (err) {
      console.error('Initialization Error:', err);
      set({ loading: false });
    } finally {
      set({ initialized: true });
    }
  },
}));
