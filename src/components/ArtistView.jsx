import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { spotify } from '../lib/spotify';
import { useSpotify } from '../context/SpotifyContext';
import TrackItem from './TrackItem';
import CardGrid from './CardGrid';

export default function ArtistView({ id }) {
  const { playTrack } = useSpotify();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        const [art, tracks, alb] = await Promise.all([
          spotify.getArtist(id),
          spotify.getArtistTopTracks(id),
          spotify.getArtistAlbums(id, 12),
        ]);
        setArtist(art);
        setTopTracks(tracks.tracks || []);
        setAlbums(alb.items || []);
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

  if (!artist) return null;

  const followers = artist.followers?.total?.toLocaleString();

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero */}
      <div className="relative h-72">
        {artist.images?.[0] ? (
          <img src={artist.images[0].url} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#282828]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-5xl font-bold text-white">{artist.name}</h1>
          {followers && (
            <p className="text-[#B3B3B3] text-sm mt-2">{followers} followers</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-5 px-6 py-4">
        <button
          onClick={() => topTracks[0] && playTrack(topTracks[0].uri)}
          className="w-14 h-14 bg-[#1DB954] hover:bg-[#1ed760] rounded-full flex items-center justify-center shadow-xl transition-colors active:scale-95"
        >
          <Play size={22} className="text-black fill-black ml-0.5" />
        </button>
      </div>

      <div className="px-6 pb-6">
        {/* Popular tracks */}
        {topTracks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Popular</h2>
            <div className="space-y-1 -mx-2">
              {topTracks.slice(0, 8).map((track, i) => (
                <TrackItem key={track.id} track={track} index={i} contextUri={null} />
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <CardGrid title="Discography" items={albums} type="album" />
        )}
      </div>
    </div>
  );
}
