import { useSpotify } from '../context/SpotifyContext';
import { Play } from 'lucide-react';

export default function CardGrid({ title, items, type }) {
  const { setView, playTrack } = useSpotify();

  const handleClick = (item) => {
    if (type === 'playlist') setView({ type: 'playlist', id: item.id });
    else if (type === 'album') setView({ type: 'album', id: item.id });
    else if (type === 'artist') setView({ type: 'artist', id: item.id });
  };

  const handlePlay = (e, item) => {
    e.stopPropagation();
    if (type === 'playlist' || type === 'album') {
      playTrack(null, item.uri);
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => handleClick(item)}
            className="bg-[#181818] hover:bg-[#282828] rounded-lg p-4 cursor-pointer transition-colors group"
          >
            <div className="relative mb-4">
              {item.images?.[0] ? (
                <img
                  src={item.images[0].url}
                  alt={item.name}
                  className={`w-full aspect-square object-cover shadow-lg ${
                    type === 'artist' ? 'rounded-full' : 'rounded-md'
                  }`}
                />
              ) : (
                <div className={`w-full aspect-square bg-[#282828] shadow-lg ${
                  type === 'artist' ? 'rounded-full' : 'rounded-md'
                }`} />
              )}
              {type !== 'artist' && (
                <button
                  onClick={(e) => handlePlay(e, item)}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
                >
                  <Play size={18} className="text-black fill-black ml-0.5" />
                </button>
              )}
            </div>
            <div className="text-sm font-semibold text-white truncate">{item.name}</div>
            <div className="text-xs text-[#B3B3B3] mt-1 truncate line-clamp-2">
              {item.description || item.artists?.map(a => a.name).join(', ') || ''}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
