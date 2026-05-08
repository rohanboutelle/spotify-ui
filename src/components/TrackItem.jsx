import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useSpotify } from '../context/SpotifyContext';
import { spotify } from '../lib/spotify';

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function TrackItem({ track, index, contextUri, offset }) {
  const { playTrack, playerState } = useSpotify();
  const [liked, setLiked] = useState(false);
  const isCurrentTrack = playerState?.item?.id === track.id;
  const isPlaying = isCurrentTrack && playerState?.is_playing;

  const handlePlay = () => {
    playTrack(track.uri, contextUri || null, offset ?? index);
  };

  const toggleLike = async (e) => {
    e.stopPropagation();
    try {
      if (liked) {
        await spotify.removeSavedTracks([track.id]);
      } else {
        await spotify.saveTracks([track.id]);
      }
      setLiked(l => !l);
    } catch (_) {}
  };

  return (
    <div
      className="track-row flex items-center gap-3 px-4 py-2 rounded-md group cursor-pointer hover:bg-[#282828] transition-colors"
      onDoubleClick={handlePlay}
    >
      {/* Index / play icon */}
      <div className="w-5 text-center shrink-0">
        {isPlaying ? (
          <span className="flex items-end gap-0.5 h-4 justify-center">
            {[1, 2, 3].map(i => (
              <span
                key={i}
                className="w-0.5 bg-[#1DB954] rounded-full animate-pulse"
                style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        ) : (
          <>
            <span className={`track-number text-sm ${isCurrentTrack ? 'text-[#1DB954]' : 'text-[#B3B3B3]'}`}>
              {index + 1}
            </span>
            <button
              onClick={handlePlay}
              className="track-play-btn hidden items-center justify-center text-white"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </>
        )}
      </div>

      {/* Album art */}
      {track.album?.images?.[0] && (
        <img
          src={track.album.images[0].url}
          alt={track.album.name}
          className="w-10 h-10 rounded object-cover shrink-0"
        />
      )}

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-[#1DB954]' : 'text-white'}`}>
          {track.name}
        </div>
        <div className="text-xs text-[#B3B3B3] truncate">
          {track.artists?.map(a => a.name).join(', ')}
        </div>
      </div>

      {/* Album name */}
      <div className="hidden md:block text-xs text-[#B3B3B3] w-40 truncate">
        {track.album?.name}
      </div>

      {/* Like button */}
      <button
        onClick={toggleLike}
        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 ${liked ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}
      >
        <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
      </button>

      {/* Duration */}
      <div className="text-xs text-[#B3B3B3] w-10 text-right shrink-0">
        {formatMs(track.duration_ms)}
      </div>
    </div>
  );
}
