import { useEffect, useState } from 'react';
import { Play, Pause, Clock } from 'lucide-react';
import { spotify } from '../lib/spotify';
import { useSpotify } from '../context/SpotifyContext';

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function AlbumView({ id }) {
  const { playTrack, togglePlay, playerState } = useSpotify();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isContextPlaying =
    playerState?.context?.uri === album?.uri && playerState?.is_playing;

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        const [al, tr] = await Promise.all([
          spotify.getAlbum(id),
          spotify.getAlbumTracks(id),
        ]);
        setAlbum(al);
        setTracks(tr.items || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!album) return null;

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-[#535353] to-[#121212] min-h-[220px]">
        {album.images?.[0] && (
          <img src={album.images[0].url} alt={album.name} className="w-44 h-44 rounded-md shadow-2xl shrink-0 object-cover" />
        )}
        <div>
          <span className="text-xs font-bold uppercase text-white">{album.album_type}</span>
          <h1 className="text-4xl font-bold text-white mt-1 mb-2">{album.name}</h1>
          <p className="text-sm text-[#B3B3B3]">
            <span className="text-white font-semibold">{album.artists?.map(a => a.name).join(', ')}</span>
            {' · '}{new Date(album.release_date).getFullYear()}
            {' · '}{tracks.length} songs
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-5 px-6 py-4">
        <button
          onClick={() => {
            if (isContextPlaying) togglePlay();
            else playTrack(null, album.uri, 0);
          }}
          className="w-14 h-14 bg-[#1DB954] hover:bg-[#1ed760] rounded-full flex items-center justify-center shadow-xl transition-colors active:scale-95"
        >
          {isContextPlaying ? (
            <Pause size={22} className="text-black fill-black" />
          ) : (
            <Play size={22} className="text-black fill-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Track list */}
      <div className="flex items-center gap-3 px-6 py-2 border-b border-white/10 text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">
        <div className="w-5 text-center">#</div>
        <div className="flex-1">Title</div>
        <div className="w-10 text-right"><Clock size={14} /></div>
      </div>

      <div className="px-2 pb-6">
        {tracks.map((track, i) => {
          const isCurrentTrack = playerState?.item?.id === track.id;
          const isPlaying = isCurrentTrack && playerState?.is_playing;
          return (
            <div
              key={track.id}
              className="track-row flex items-center gap-3 px-4 py-2 rounded-md group cursor-pointer hover:bg-[#282828] transition-colors"
              onDoubleClick={() => playTrack(track.uri, album.uri, i)}
            >
              <div className="w-5 text-center shrink-0">
                {isPlaying ? (
                  <span className="flex items-end gap-0.5 h-4 justify-center">
                    {[1, 2, 3].map(j => (
                      <span key={j} className="w-0.5 bg-[#1DB954] rounded-full animate-pulse" style={{ height: `${6 + j * 3}px`, animationDelay: `${j * 0.15}s` }} />
                    ))}
                  </span>
                ) : (
                  <>
                    <span className={`track-number text-sm ${isCurrentTrack ? 'text-[#1DB954]' : 'text-[#B3B3B3]'}`}>{i + 1}</span>
                    <button
                      onClick={() => playTrack(track.uri, album.uri, i)}
                      className="track-play-btn hidden items-center justify-center text-white"
                    >
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  </>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-[#1DB954]' : 'text-white'}`}>{track.name}</div>
                <div className="text-xs text-[#B3B3B3] truncate">{track.artists?.map(a => a.name).join(', ')}</div>
              </div>
              <div className="text-xs text-[#B3B3B3] w-10 text-right shrink-0">{formatMs(track.duration_ms)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
