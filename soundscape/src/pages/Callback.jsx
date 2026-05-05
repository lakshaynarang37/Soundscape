import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Callback() {
  const navigate    = useNavigate();
  const { setToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    const state  = params.get('state');
    const error  = params.get('error');

    if (error) {
      navigate(`/?error=${error}`);
      return;
    }

    if (!code) {
      navigate('/?error=no_code');
      return;
    }

    exchangeCodeForToken(code, state)
      .then(token => {
        setToken(token);
        navigate('/dashboard');
      })
      .catch(err => {
        console.error('Auth callback error:', err);
        navigate('/?error=token_failed');
      });
  }, [navigate, setToken]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-base">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-spotify border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-text-secondary font-body text-sm tracking-wide">
          Connecting to Spotify…
        </p>
      </div>
    </div>
  );
}
