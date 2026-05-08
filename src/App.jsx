import { useEffect, useState } from 'react';
import { isLoggedIn, handleCallback, clearIfScopesMismatch } from './lib/auth';
import { SpotifyProvider } from './context/SpotifyContext';
import Login from './components/Login';
import Layout from './components/Layout';

clearIfScopesMismatch();

export default function App() {
  const [authed, setAuthed] = useState(isLoggedIn());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');

    if (errorParam) {
      setError('Spotify authorization was denied.');
      window.history.replaceState({}, '', '/');
      return;
    }

    if (code) {
      setLoading(true);
      handleCallback(code)
        .then(() => {
          setAuthed(true);
          window.history.replaceState({}, '', '/');
        })
        .catch(() => {
          setError('Authentication failed. Please try again.');
        })
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#B3B3B3]">Connecting to Spotify…</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return <Login error={error} />;
  }

  return (
    <SpotifyProvider>
      <Layout />
    </SpotifyProvider>
  );
}
