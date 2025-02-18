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
        data: { name },
        emailRedirectTo: undefined,
      }
    });

    if (authError) {
      console.error('Signup error:', authError);
      return { user: null, error: authError };
    }

    if (!authData?.user) {
      return {
        user: null,
        error: { 
          name: 'SignUpError', 
          message: 'Failed to create account' 
        } as AuthError
      };
    }

    // Create profile for the user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ 
        id: authData.user.id,
        name,
        email 
      }]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    // Auto sign in after signup
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Auto sign-in error:', signInError);
    }

    return { 
      user: user || authData.user,
      error: null 
    };
  } catch (error) {
    console.error('Signup process error:', error);
    return {
      user: null,
      error: {
        name: 'AuthError',
        message: error instanceof Error ? error.message : 'Failed to create account'
      } as AuthError
    };
  }
};