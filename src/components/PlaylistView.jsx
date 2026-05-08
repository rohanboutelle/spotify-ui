import { useEffect, useState, useCallback } from 'react';
import { Play, Pause, Shuffle, Clock } from 'lucide-react';
import { spotify } from '../lib/spotify';
import { useSpotify } from '../context/SpotifyContext';
import TrackItem from './TrackItem';

export default function PlaylistView({ id }) {
  const { playTrack, togglePlay, playerState } = useSpotify();
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(null);

  const isContextPlaying =
    playerState?.context?.uri === playlist?.uri && playerState?.is_playing;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTracks([]);
    setPlaylist(null);

    const attempt = async () => {
      const [pl, tr] = await Promise.all([
        spotify.getPlaylist(id),
        spotify.getPlaylistTracks(id, 50, 0),
      ]);
      setPlaylist(pl);
      setTracks(tr.items?.filter(i => i.track) || []);
      setNextOffset(tr.next ? 50 : null);
    };

    try {
      await attempt();
    } catch (firstErr) {
      try {
        await new Promise(r => setTimeout(r, 1000));
        await attempt();
      } catch (err) {
        setError(err?.message || firstErr?.message || 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const loadMore = useCallback(async () => {
    if (!nextOffset || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await spotify.getPlaylistTracks(id, 50, nextOffset);
      setTracks(prev => [...prev, ...(data.items?.filter(i => i.track) || [])]);
      setNextOffset(data.next ? nextOffset + 50 : null);
    } finally {
      setLoadingMore(false);
    }
  }, [id, nextOffset, loadingMore]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 200) loadMore();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-[#B3B3B3] text-sm">Failed to load playlist.</p>
        <p className="text-[#6A6A6A] text-xs font-mono max-w-sm text-center">{error}</p>
        <button
          onClick={load}
          className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2 px-6 rounded-full text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!playlist) return null;

  const coverImage = playlist.images?.[0]?.url;
  const totalTracks = playlist.tracks?.total || tracks.length;
  const totalMs = tracks.reduce((acc, item) => acc + (item.track?.duration_ms || 0), 0);
  const totalMin = Math.floor(totalMs / 60000);

  return (
    <div className="h-full overflow-y-auto" onScroll={handleScroll}>
      {/* Header */}
      <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-[#535353] to-[#121212] min-h-[240px]">
        {coverImage ? (
          <img
            src={coverImage}
            alt={playlist.name}
            className="w-48 h-48 rounded-md shadow-2xl object-cover shrink-0"
          />
        ) : (
          <div className="w-48 h-48 rounded-md bg-[#282828] shadow-2xl shrink-0" />
        )}
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-xs font-bold uppercase text-white">Playlist</span>
          <h1 className="text-4xl font-bold text-white leading-tight">{playlist.name}</h1>
          {playlist.description && (
            <p
              className="text-sm text-[#B3B3B3] line-clamp-2"
              dangerouslySetInnerHTML={{ __html: playlist.description }}
            />
          )}
          <div className="flex items-center gap-1 text-sm text-[#B3B3B3] mt-1 flex-wrap">
            <span className="font-semibold text-white">{playlist.owner?.display_name}</span>
            <span>·</span>
            <span>{totalTracks} songs</span>
            {totalMin > 0 && (
              <>
                <span>·</span>
                <span>about {totalMin >= 60 ? `${Math.floor(totalMin / 60)} hr ${totalMin % 60} min` : `${totalMin} min`}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-5 px-6 py-4 bg-gradient-to-b from-[#1A1A1A] to-transparent">
        <button
          onClick={() => {
            if (isContextPlaying) {
              togglePlay();
            } else {
              playTrack(null, playlist.uri, 0);
            }
          }}
          className="w-14 h-14 bg-[#1DB954] hover:bg-[#1ed760] rounded-full flex items-center justify-center shadow-xl transition-colors active:scale-95"
        >
          {isContextPlaying ? (
            <Pause size={22} className="text-black fill-black" />
          ) : (
            <Play size={22} className="text-black fill-black ml-0.5" />
          )}
        </button>
        <button className="text-[#B3B3B3] hover:text-white transition-colors">
          <Shuffle size={22} />
        </button>
      </div>

      {/* Track list header */}
      <div className="flex items-center gap-3 px-6 py-2 border-b border-white/10 text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">
        <div className="w-5 text-center">#</div>
        <div className="flex-1">Title</div>
        <div className="hidden md:block w-40">Album</div>
        <div className="w-10 text-right"><Clock size={14} /></div>
      </div>

      {/* Tracks */}
      <div className="px-2 pb-6">
        {tracks.map((item, i) => (
          <TrackItem
            key={`${item.track.id}-${i}`}
            track={item.track}
            index={i}
            contextUri={playlist.uri}
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
