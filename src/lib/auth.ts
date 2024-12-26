import { supabase } from './supabase';
import type { AuthError, User } from '@supabase/supabase-js';

export type AuthResponse = {
  user: User | null;
  error: AuthError | null;
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error };
    }

    return { user, error: null };
  } catch (error) {
    return {
      user: null,
      error: {
        name: 'AuthError',
        message: error instanceof Error ? error.message : 'Failed to sign in'
      } as AuthError
    };
  }
};

export const signUp = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name // Store name in user metadata
        }
      }
    });

    if (authError) {
      return { user: null, error: authError };
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: authData.user.id,
          name,
          email 
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { user: authData.user, error: null };
      }
    }

    return { user: authData.user, error: null };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      user: null,
      error: {
        name: 'AuthError',
        message: error instanceof Error ? error.message : 'Failed to create account'
      } as AuthError
    };
  }
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};