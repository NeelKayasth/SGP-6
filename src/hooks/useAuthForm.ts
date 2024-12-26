import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../lib/auth';

export const useAuthForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user, error } = await signIn(email, password);
      
      if (error) throw error;
      if (user) navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);

      const { user, error } = await signUp(email, password, name);
      
      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('An account with this email already exists');
        }
        throw error;
      }
      
      if (user) {
        // Redirect to signin page after successful signup
        navigate('/signin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleSignIn, handleSignUp };
};