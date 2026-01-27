import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// E2E Test Key - only works in development
const E2E_TEST_KEY = import.meta.env.VITE_E2E_TEST_KEY;
const IS_PRODUCTION = import.meta.env.PROD;

type OAuthProvider = 'google' | 'github';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null; isE2ELogin?: boolean }>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; isNewUser?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Send authentication email via Resend edge function
const sendAuthEmail = async (
  type: 'magic_link' | 'welcome' | 'password_reset' | 'login_success',
  email: string,
  token?: string,
  redirectUrl?: string,
  userName?: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-auth-email', {
      body: { type, email, token, redirectUrl, userName }
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

// Create a mock user for E2E testing
function createE2ETestUser(email: string): User {
  return {
    id: 'e2e-test-user-id',
    email: email,
    app_metadata: {},
    user_metadata: {
      display_name: 'E2E Test User',
      company_name: 'Test Company',
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User;
}

function createE2ETestSession(user: User): Session {
  return {
    access_token: 'e2e-test-access-token',
    refresh_token: 'e2e-test-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  } as Session;
}

// Check if email contains the E2E test key
function isE2ETestEmail(email: string): boolean {
  if (IS_PRODUCTION || !E2E_TEST_KEY) return false;
  // Format: anything+e2e-{SECRET_KEY}@anyhost.com
  const pattern = new RegExp(`\\+e2e-${E2E_TEST_KEY}@`);
  return pattern.test(email);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for E2E test session first (use localStorage for Playwright compatibility)
    const e2eSession = localStorage.getItem('e2e_test_session');
    if (e2eSession && !IS_PRODUCTION) {
      try {
        const { user: testUser, session: testSession } = JSON.parse(e2eSession);
        setUser(testUser);
        setSession(testSession);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('e2e_test_session');
      }
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Send login success email on sign in (not for new users - they get welcome email)
        if (event === 'SIGNED_IN' && session?.user) {
          const isNewUser = session.user.created_at && 
            (new Date().getTime() - new Date(session.user.created_at).getTime()) < 60000; // within 1 minute
          
          if (!isNewUser) {
            // Existing user logged in - send login success email from AI agent
            setTimeout(() => {
              sendAuthEmail('login_success', session.user.email || '', undefined, undefined, session.user.user_metadata?.name);
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

  const signInWithMagicLink = async (email: string): Promise<{ error: Error | null; isE2ELogin?: boolean }> => {
    // E2E Test: Use real Supabase authentication via Edge Function
    if (isE2ETestEmail(email)) {
      try {
        console.log('E2E Login: Calling dev-auth Edge Function');
        
        // Call Edge Function to get real magic link token
        const { data, error: fnError } = await supabase.functions.invoke('dev-auth', {
          body: { email }
        });

        if (fnError || !data) {
          console.error('E2E Login: Edge Function error', fnError);
          return { error: fnError || new Error('Failed to get authentication token') };
        }

        console.log('E2E Login: Verifying OTP token');
        
        // Use the real token to establish a real Supabase session
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: data.email,
          token: data.token,
          type: 'magiclink'
        });

        if (verifyError) {
          console.error('E2E Login: OTP verification error', verifyError);
          return { error: verifyError };
        }

        console.log('E2E Login: Successfully authenticated with real Supabase session');
        return { error: null, isE2ELogin: true };
      } catch (err) {
        console.error('E2E Login: Unexpected error', err);
        return { error: err as Error };
      }
    }

    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    return { error: error as Error | null };
  };

  const signInWithOAuth = async (provider: OAuthProvider) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    // E2E Test: Use real Supabase authentication via Edge Function
    if (isE2ETestEmail(email)) {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('dev-auth', {
          body: { email }
        });

        if (fnError || !data) {
          return { error: fnError || new Error('Failed to get authentication token') };
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: data.email,
          token: data.token,
          type: 'magiclink'
        });

        if (verifyError) {
          return { error: verifyError, isNewUser: false };
        }

        return { error: null, isNewUser: true };
      } catch (err) {
        return { error: err as Error, isNewUser: false };
      }
    }

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
    // E2E Test: Use real Supabase authentication via Edge Function
    if (isE2ETestEmail(email)) {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('dev-auth', {
          body: { email }
        });

        if (fnError || !data) {
          return { error: fnError || new Error('Failed to get authentication token') };
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: data.email,
          token: data.token,
          type: 'magiclink'
        });

        if (verifyError) {
          return { error: verifyError };
        }

        return { error: null };
      } catch (err) {
        return { error: err as Error };
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Clear E2E test session if exists
    localStorage.removeItem('e2e_test_session');
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithMagicLink,
      signInWithOAuth,
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
