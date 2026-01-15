import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; isNewUser?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Send authentication email via Resend edge function
const sendAuthEmail = async (type: 'magic_link' | 'welcome' | 'password_reset', email: string, token?: string, redirectUrl?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-auth-email', {
      body: { type, email, token, redirectUrl }
    });
    
    if (error) {
      console.error('Failed to send auth email:', error);
      return false;
    }
    
    console.log('Auth email sent successfully:', data);
    return true;
  } catch (err) {
    console.error('Error sending auth email:', err);
    return false;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Send welcome email on first sign up (deferred to avoid deadlock)
        if (event === 'SIGNED_IN' && session?.user) {
          const isNewUser = session.user.created_at && 
            (new Date().getTime() - new Date(session.user.created_at).getTime()) < 60000; // within 1 minute
          
          if (isNewUser) {
            setTimeout(() => {
              sendAuthEmail('welcome', session.user.email || '');
            }, 0);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    
    // Note: Supabase handles the OTP email internally
    // If you want to fully customize, you'd need to use a custom SMTP setup
    // The edge function is available for additional welcome/notification emails
    
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    // If signup was successful and user was created, send welcome email
    if (!error && data.user) {
      // Send welcome email asynchronously (don't block the response)
      setTimeout(() => {
        sendAuthEmail('welcome', email);
      }, 1000);
    }

    return { 
      error: error as Error | null,
      isNewUser: !!data.user && !data.user.email_confirmed_at
    };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signInWithMagicLink,
      signUp,
      signIn,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
