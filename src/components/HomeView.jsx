import { useEffect, useState } from 'react';
import { spotify } from '../lib/spotify';
import { useSpotify } from '../context/SpotifyContext';
import TrackItem from './TrackItem';
import CardGrid from './CardGrid';

export default function HomeView() {
  const { user } = useSpotify();
  const [recentTracks, setRecentTracks] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [recent, top, feat, releases] = await Promise.allSettled([
          spotify.getRecentlyPlayed(12),
          spotify.getTopTracks(10),
          spotify.getFeaturedPlaylists(8),
          spotify.getNewReleases(8),
        ]);

        if (recent.status === 'fulfilled') {
          const seen = new Set();
          const unique = (recent.value?.items || []).filter(item => {
            if (seen.has(item.track.id)) return false;
            seen.add(item.track.id);
            return true;
          });
          setRecentTracks(unique.slice(0, 8));
        }
        if (top.status === 'fulfilled') setTopTracks(top.value?.items || []);
        if (feat.status === 'fulfilled') setFeatured(feat.value?.playlists?.items || []);
        if (releases.status === 'fulfilled') setNewReleases(releases.value?.albums?.items || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          {greeting}{user?.display_name ? `, ${user.display_name}` : ''}
        </h1>

        {/* Jump back in */}
        {recentTracks.length > 0 && (
          <section className="mb-8">
            <div className="grid grid-cols-2 gap-2">
              {recentTracks.slice(0, 6).map(item => (
                <RecentCard key={item.played_at + item.track.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Top tracks */}
        {topTracks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Your top tracks</h2>
            <div className="space-y-1">
              {topTracks.slice(0, 8).map((track, i) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  index={i}
                  contextUri={null}
                />
              ))}
            </div>
          </section>
        )}

        {/* Featured playlists */}
        {featured.length > 0 && (
          <CardGrid title="Featured playlists" items={featured} type="playlist" />
        )}

        {/* New releases */}
        {newReleases.length > 0 && (
          <CardGrid title="New releases" items={newReleases} type="album" />
        )}
      </div>
    </div>
  );
}

function RecentCard({ item }) {
  const { playTrack, playerState } = useSpotify();
  const track = item.track;
  const isPlaying = playerState?.item?.id === track.id && playerState?.is_playing;

  return (
    <button
      onClick={() => playTrack(track.uri)}
      className={`flex items-center gap-3 rounded-md overflow-hidden transition-colors group ${
        isPlaying ? 'bg-[#282828]' : 'bg-[#282828] hover:bg-[#3E3E3E]'
      }`}
    >
      {track.album?.images?.[0] ? (
        <img
          src={track.album.images[0].url}
          alt={track.name}
          className="w-12 h-12 object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 bg-[#3E3E3E] shrink-0" />
      )}
      <span className="text-sm font-semibold text-white truncate pr-2 text-left">
        {track.name}
      </span>
      {isPlaying && (
        <span className="ml-auto pr-3 flex items-end gap-0.5 h-4">
          {[1, 2, 3].map(i => (
            <span
              key={i}
              className="w-0.5 bg-[#1DB954] rounded-full animate-pulse"
              style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      )}
    </button>
  );
}
