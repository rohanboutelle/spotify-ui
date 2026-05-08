import { useState, useEffect } from 'react';
import { List } from 'lucide-react';
import { useSpotify } from '../context/SpotifyContext';

export default function NowPlayingBar() {
  const { playerState, queue, fetchQueue } = useSpotify();
  const [showQueue, setShowQueue] = useState(false);

  const track = playerState?.item;

  useEffect(() => {
    if (showQueue) fetchQueue();
  }, [showQueue, fetchQueue]);

  if (!track) return null;

  return (
    <div className="w-72 shrink-0 bg-[#121212] rounded-lg overflow-hidden flex flex-col">
      {/* Now playing panel */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Large album art */}
        <div className="relative mb-4">
          {track.album?.images?.[0] && (
            <img
              src={track.album.images[0].url}
              alt={track.name}
              className="w-full aspect-square rounded-lg object-cover shadow-2xl"
            />
          )}
        </div>

        {/* Track info */}
        <div className="mb-4">
          <div className="text-white font-bold text-base truncate">{track.name}</div>
          <div className="text-[#B3B3B3] text-sm truncate mt-0.5">
            {track.artists?.map(a => a.name).join(', ')}
          </div>
          <div className="text-[#6A6A6A] text-xs truncate mt-0.5">
            {track.album?.name}
          </div>
        </div>

        {/* Queue toggle */}
        <button
          onClick={() => setShowQueue(v => !v)}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors mb-3 ${
            showQueue ? 'bg-[#282828] text-white' : 'text-[#B3B3B3] hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          <List size={14} />
          {showQueue ? 'Hide queue' : 'Show queue'}
        </button>

        {/* Queue */}
        {showQueue && queue.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider mb-2 px-1">
              Next up
            </div>
            <div className="space-y-1">
              {queue.slice(0, 10).map((t, i) => (
                <div
                  key={`${t.id}-${i}`}
                  className="flex items-center gap-2 px-1 py-1 rounded hover:bg-[#282828] transition-colors cursor-pointer"
                >
                  {t.album?.images?.[2] && (
                    <img src={t.album.images[2].url} alt={t.name} className="w-8 h-8 rounded object-cover shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs text-white font-medium truncate">{t.name}</div>
                    <div className="text-xs text-[#B3B3B3] truncate">{t.artists?.map(a => a.name).join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
