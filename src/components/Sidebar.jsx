import { useState } from 'react';
import { Home, Search, Library, Plus, ChevronRight, Music2, LogOut, Copy, Check } from 'lucide-react';
import { useSpotify } from '../context/SpotifyContext';
import { logout, exportTokens } from '../lib/auth';

export default function Sidebar() {
  const { playlists, view, setView, user } = useSpotify();
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleExport = () => {
    navigator.clipboard.writeText(exportTokens());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPlaylists = playlists.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  const navItems = [
    { icon: Home, label: 'Home', action: () => setView({ type: 'home' }) },
    { icon: Search, label: 'Search', action: () => setView({ type: 'search' }) },
  ];

  return (
    <div className="flex flex-col w-64 shrink-0 bg-[#121212] rounded-lg overflow-hidden">
      {/* Logo */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-5">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span className="font-bold text-white text-base">Spotify</span>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {navItems.map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                (label === 'Home' && view.type === 'home') ||
                (label === 'Search' && view.type === 'search')
                  ? 'bg-[#282828] text-white'
                  : 'text-[#B3B3B3] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Library */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#121212] rounded-lg mt-2 mx-0">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button
            onClick={() => setView({ type: 'library' })}
            className="flex items-center gap-2 text-[#B3B3B3] hover:text-white transition-colors font-semibold text-sm"
          >
            <Library size={20} />
            Your Library
          </button>
          <button className="text-[#B3B3B3] hover:text-white transition-colors p-1 rounded-full hover:bg-[#282828]">
            <Plus size={18} />
          </button>
        </div>

        {/* Search playlists */}
        {playlists.length > 6 && (
          <div className="px-3 pb-2">
            <input
              type="text"
              placeholder="Search in Your Library"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full bg-[#282828] text-white text-xs px-3 py-2 rounded-md placeholder-[#6A6A6A] outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        )}

        {/* Playlists */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {/* Liked Songs */}
          <button
            onClick={() => setView({ type: 'liked' })}
            className={`flex items-center gap-3 w-full px-2 py-2 rounded-md transition-colors group ${
              view.type === 'liked' ? 'bg-[#282828]' : 'hover:bg-[#1A1A1A]'
            }`}
          >
            <div className="w-10 h-10 rounded bg-gradient-to-br from-indigo-500 to-[#1DB954] flex items-center justify-center shrink-0">
              <Music2 size={16} className="text-white" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-sm font-medium text-white truncate">Liked Songs</div>
              <div className="text-xs text-[#B3B3B3] truncate">Playlist</div>
            </div>
          </button>

          {filteredPlaylists.map(playlist => (
            <button
              key={playlist.id}
              onClick={() => setView({ type: 'playlist', id: playlist.id })}
              className={`flex items-center gap-3 w-full px-2 py-2 rounded-md transition-colors group ${
                view.type === 'playlist' && view.id === playlist.id
                  ? 'bg-[#282828]'
                  : 'hover:bg-[#1A1A1A]'
              }`}
            >
              {playlist.images?.[0] ? (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  className="w-10 h-10 rounded object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-[#282828] flex items-center justify-center shrink-0">
                  <Music2 size={16} className="text-[#B3B3B3]" />
                </div>
              )}
              <div className="text-left min-w-0">
                <div className={`text-sm font-medium truncate ${
                  view.type === 'playlist' && view.id === playlist.id
                    ? 'text-[#1DB954]'
                    : 'text-white'
                }`}>
                  {playlist.name}
                </div>
                <div className="text-xs text-[#B3B3B3] truncate">
                  {playlist.owner?.display_name || 'Playlist'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* User */}
      {user && (
        <div className="flex items-center gap-2 px-3 py-3 border-t border-white/5">
          {user.images?.[0] ? (
            <img src={user.images[0].url} alt={user.display_name} className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#282828] flex items-center justify-center">
              <span className="text-xs text-white font-bold">{user.display_name?.[0]}</span>
            </div>
          )}
          <span className="text-xs font-semibold text-white flex-1 truncate">{user.display_name}</span>
          <button
            onClick={handleExport}
            title="Export tokens to use on another device"
            className="text-[#B3B3B3] hover:text-white transition-colors p-1"
          >
            {copied ? <Check size={14} className="text-[#1DB954]" /> : <Copy size={14} />}
          </button>
          <button
            onClick={handleLogout}
            title="Log out"
            className="text-[#B3B3B3] hover:text-white transition-colors p-1"
          >
            <LogOut size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
