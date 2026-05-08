import { useState } from 'react';
import { initiateLogin, importTokens } from '../lib/auth';

export default function Login({ error: authError, onAuthed }) {
  const [showImport, setShowImport] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [importError, setImportError] = useState('');

  const handleImport = () => {
    setImportError('');
    try {
      importTokens(tokenInput.trim());
      window.location.reload();
    } catch {
      setImportError('Invalid token data. Make sure you copied it correctly.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#121212]">
      <div className="text-center max-w-sm px-6 w-full">
        {/* Spotify logo */}
        <div className="flex justify-center mb-8">
          <svg viewBox="0 0 24 24" className="w-16 h-16 fill-[#1DB954]" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-white mb-3">Spotify Player</h1>
        <p className="text-[#B3B3B3] mb-10 text-base leading-relaxed">
          Stream your music. Control playback, browse playlists, and discover new tracks — all in one place.
        </p>

        {authError && (
          <div className="bg-red-900/40 border border-red-500/40 text-red-300 rounded-lg px-4 py-3 mb-6 text-sm">
            {authError}
          </div>
        )}

        <button
          onClick={initiateLogin}
          className="w-full bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 text-black font-bold py-4 px-8 rounded-full text-base transition-all duration-150"
        >
          Log in with Spotify
        </button>

        {/* Token import */}
        <div className="mt-6">
          <button
            onClick={() => setShowImport(v => !v)}
            className="text-[#B3B3B3] hover:text-white text-sm underline underline-offset-2 transition-colors"
          >
            {showImport ? 'Hide' : 'Blocked by a filter? Import tokens'}
          </button>

          {showImport && (
            <div className="mt-4 text-left">
              <p className="text-[#B3B3B3] text-xs mb-3 leading-relaxed">
                Log in on a device without restrictions, click the export button in the sidebar, then paste the copied text below.
              </p>
              <textarea
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder='Paste token JSON here…'
                rows={4}
                className="w-full bg-[#282828] text-white text-xs px-3 py-2 rounded-lg placeholder-[#6A6A6A] outline-none focus:ring-1 focus:ring-white/20 resize-none font-mono"
              />
              {importError && (
                <p className="text-red-400 text-xs mt-2">{importError}</p>
              )}
              <button
                onClick={handleImport}
                disabled={!tokenInput.trim()}
                className="mt-3 w-full bg-[#282828] hover:bg-[#3E3E3E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-full text-sm transition-colors"
              >
                Import and log in
              </button>
            </div>
          )}
        </div>

        <p className="text-[#6A6A6A] text-xs mt-6 leading-relaxed">
          Requires a Spotify account. A Premium subscription is needed for in-browser playback. Free accounts can use remote device control.
        </p>
      </div>
    </div>
  );
}
