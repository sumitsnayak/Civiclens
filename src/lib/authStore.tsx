import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSupabaseConnected: boolean;
  loading: boolean;
  signInAsDemoUser: (role: UserRole) => void;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfileName: (name: string) => void;
}

const DEMO_CITIZEN: UserProfile = {
  id: 'usr-citizen-1',
  display_name: 'Marcus Vance',
  email: 'marcus.vance@civiclens.test',
  role: 'citizen',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
};

const DEMO_ADMIN: UserProfile = {
  id: 'usr-admin-1',
  display_name: 'Director Sharma (Admin)',
  email: 'admin.sharma@civiclens.test',
  role: 'admin',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  created_at: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Check saved session in local storage
    const saved = localStorage.getItem('civiclens_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse cached user:', e);
      }
    }
    // Default to citizen demo for smooth hackathon testing
    return DEMO_CITIZEN;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Check active Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchSupabaseProfile(session.user.id, session.user.email);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchSupabaseProfile(session.user.id, session.user.email);
        } else {
          // If supabase sign out occurs
          if (user && !user.id.startsWith('usr-')) {
            setUser(null);
            localStorage.removeItem('civiclens_current_user');
          }
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const fetchSupabaseProfile = async (uid: string, email?: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (!error && data) {
        const profile: UserProfile = {
          id: data.id,
          display_name: data.display_name || email?.split('@')[0] || 'Citizen',
          email: email,
          role: data.role as UserRole,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
        };
        setUser(profile);
        localStorage.setItem('civiclens_current_user', JSON.stringify(profile));
      } else {
        // Fallback profile if profile row is not yet generated
        const fallback: UserProfile = {
          id: uid,
          display_name: email?.split('@')[0] || 'Citizen',
          email: email,
          role: 'citizen',
        };
        setUser(fallback);
        localStorage.setItem('civiclens_current_user', JSON.stringify(fallback));
      }
    } catch (e) {
      console.warn('Error fetching user profile:', e);
    }
  };

  const signInAsDemoUser = (role: UserRole) => {
    const demo = role === 'admin' ? DEMO_ADMIN : DEMO_CITIZEN;
    setUser(demo);
    localStorage.setItem('civiclens_current_user', JSON.stringify(demo));
  };

  const signInWithEmail = async (email: string, pass: string): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        setLoading(false);
        if (error) return { error: error.message };
        return { error: null };
      }

      // Demo login
      await new Promise((r) => setTimeout(r, 600));
      const role: UserRole = email.toLowerCase().includes('admin') ? 'admin' : 'citizen';
      const mockUser: UserProfile = {
        id: 'usr-' + Date.now().toString(36),
        display_name: email.split('@')[0],
        email,
        role,
      };
      setUser(mockUser);
      localStorage.setItem('civiclens_current_user', JSON.stringify(mockUser));
      setLoading(false);
      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'Login failed' };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { display_name: name },
          },
        });
        setLoading(false);
        if (error) return { error: error.message };
        return { error: null };
      }

      // Demo signup
      await new Promise((r) => setTimeout(r, 600));
      const mockUser: UserProfile = {
        id: 'usr-' + Date.now().toString(36),
        display_name: name || email.split('@')[0],
        email,
        role: 'citizen', // New signups always default to citizen role
      };
      setUser(mockUser);
      localStorage.setItem('civiclens_current_user', JSON.stringify(mockUser));
      setLoading(false);
      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'Registration failed' };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('civiclens_current_user');
  };

  const updateProfileName = (name: string) => {
    if (user) {
      const updated = { ...user, display_name: name };
      setUser(updated);
      localStorage.setItem('civiclens_current_user', JSON.stringify(updated));
    }
  };

  const role: UserRole = user?.role || 'citizen';
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isSupabaseConnected: isSupabaseConfigured,
        loading,
        signInAsDemoUser,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

