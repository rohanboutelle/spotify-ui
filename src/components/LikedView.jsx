import { useEffect, useState, useCallback } from 'react';
import { Play, Pause, Clock } from 'lucide-react';
import { spotify } from '../lib/spotify';
import { useSpotify } from '../context/SpotifyContext';
import TrackItem from './TrackItem';

export default function LikedView() {
  const { playTrack, togglePlay, playerState } = useSpotify();
  const [tracks, setTracks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await spotify.getSavedTracks(50, 0);
        setTracks(data.items || []);
        setTotal(data.total || 0);
        setNextOffset(data.next ? 50 : null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextOffset || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await spotify.getSavedTracks(50, nextOffset);
      setTracks(prev => [...prev, ...(data.items || [])]);
      setNextOffset(data.next ? nextOffset + 50 : null);
    } finally {
      setLoadingMore(false);
    }
  }, [nextOffset, loadingMore]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 200) loadMore();
  };

  const LIKED_URI = 'spotify:user:liked';

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" onScroll={handleScroll}>
      {/* Header */}
      <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-indigo-800 to-[#121212] min-h-[240px]">
        <div className="w-48 h-48 rounded-md shadow-2xl bg-gradient-to-br from-indigo-500 to-[#1DB954] flex items-center justify-center shrink-0">
          <svg className="w-20 h-20 fill-white" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div>
          <span className="text-xs font-bold uppercase text-white">Playlist</span>
          <h1 className="text-4xl font-bold text-white mt-1 mb-2">Liked Songs</h1>
          <p className="text-sm text-[#B3B3B3]">{total} songs</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-5 px-6 py-4">
        <button
          onClick={() => {
            if (tracks.length > 0) playTrack(tracks[0].track.uri);
          }}
          className="w-14 h-14 bg-[#1DB954] hover:bg-[#1ed760] rounded-full flex items-center justify-center shadow-xl transition-colors active:scale-95"
        >
          <Play size={22} className="text-black fill-black ml-0.5" />
        </button>
      </div>

      {/* Header row */}
      <div className="flex items-center gap-3 px-6 py-2 border-b border-white/10 text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">
        <div className="w-5 text-center">#</div>
        <div className="flex-1">Title</div>
        <div className="hidden md:block w-40">Album</div>
        <div className="w-10 text-right"><Clock size={14} /></div>
      </div>

      <div className="px-2 pb-6">
        {tracks.map((item, i) => (
          <TrackItem
            key={`${item.track.id}-${i}`}
            track={item.track}
            index={i}
            contextUri={null}
            offset={i}
          />
        ))}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
