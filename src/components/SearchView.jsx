import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { spotify } from '../lib/spotify';
import { useSpotify } from '../context/SpotifyContext';
import TrackItem from './TrackItem';
import CardGrid from './CardGrid';

const GENRES = [
  { label: 'Pop', color: '#E8115B' },
  { label: 'Hip-Hop', color: '#BC5900' },
  { label: 'Rock', color: '#E91429' },
  { label: 'Dance/Electronic', color: '#8D67AB' },
  { label: 'R&B', color: '#E8115B' },
  { label: 'Latin', color: '#1E3264' },
  { label: 'K-Pop', color: '#148A08' },
  { label: 'Podcasts', color: '#E1118C' },
  { label: 'Jazz', color: '#EB6915' },
  { label: 'Classical', color: '#27856A' },
];

export default function SearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const data = await spotify.search(q, ['track', 'artist', 'album', 'playlist'], 10);
      setResults(data);
    } catch (_) {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 350);
  };

  const handleGenre = (genre) => {
    setQuery(genre);
    doSearch(genre);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Search</h1>

        {/* Search input */}
        <div className="relative mb-6 max-w-lg">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={handleChange}
            className="w-full bg-[#2A2A2A] text-white text-sm pl-9 pr-9 py-3 rounded-full outline-none focus:ring-2 focus:ring-white/20 placeholder-[#6A6A6A]"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Results */}
        {!loading && results && (
          <SearchResults results={results} />
        )}

        {/* No query: genre browse */}
        {!query && !loading && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4">Browse categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {GENRES.map(g => (
                <button
                  key={g.label}
                  onClick={() => handleGenre(g.label)}
                  className="relative rounded-lg overflow-hidden aspect-[2/1] p-4 text-left"
                  style={{ backgroundColor: g.color }}
                >
                  <span className="text-white font-bold text-sm">{g.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SearchResults({ results }) {
  const { setView } = useSpotify();
  const tracks = results?.tracks?.items || [];
  const artists = results?.artists?.items || [];
  const albums = results?.albums?.items || [];
  const playlists = results?.playlists?.items?.filter(Boolean) || [];

  return (
    <div>
      {/* Top result + top tracks */}
      {tracks.length > 0 && (
        <div className="flex gap-6 mb-8">
          {/* Top result */}
          <div className="w-64 shrink-0">
            <h2 className="text-lg font-bold text-white mb-4">Top result</h2>
            <TopResultCard track={tracks[0]} />
          </div>

          {/* Tracks */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white mb-4">Songs</h2>
            <div className="space-y-1">
              {tracks.slice(0, 5).map((track, i) => (
                <TrackItem key={track.id} track={track} index={i} contextUri={null} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Artists */}
      {artists.length > 0 && (
        <CardGrid title="Artists" items={artists} type="artist" />
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <CardGrid title="Albums" items={albums} type="album" />
      )}

      {/* Playlists */}
      {playlists.length > 0 && (
        <CardGrid title="Playlists" items={playlists} type="playlist" />
      )}
    </div>
  );
}

function TopResultCard({ track }) {
  const { playTrack, playerState } = useSpotify();
  const isPlaying = playerState?.item?.id === track.id && playerState?.is_playing;

  return (
    <div
      className="bg-[#282828] hover:bg-[#3E3E3E] rounded-lg p-5 cursor-pointer group transition-colors relative"
      onClick={() => playTrack(track.uri)}
    >
      {track.album?.images?.[0] && (
        <img
          src={track.album.images[0].url}
          alt={track.name}
          className="w-20 h-20 rounded-md shadow-lg mb-4"
        />
      )}
      <div className="text-white font-bold text-xl truncate">{track.name}</div>
      <div className="text-[#B3B3B3] text-sm mt-1 truncate">
        {track.artists?.map(a => a.name).join(', ')} · Song
      </div>
      <button className="absolute bottom-4 right-4 w-12 h-12 bg-[#1DB954] rounded-full items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 hidden group-hover:flex">
        {isPlaying ? (
          <span className="flex items-end gap-0.5 h-4">
            {[1, 2, 3].map(i => (
              <span key={i} className="w-0.5 bg-black rounded-full animate-pulse" style={{ height: `${8 + i * 3}px` }} />
            ))}
          </span>
        ) : (
          <svg className="w-5 h-5 fill-black ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
    </div>
  );
}
