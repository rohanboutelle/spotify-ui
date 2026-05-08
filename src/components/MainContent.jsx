import { useSpotify } from '../context/SpotifyContext';
import HomeView from './HomeView';
import SearchView from './SearchView';
import PlaylistView from './PlaylistView';
import LikedView from './LikedView';
import AlbumView from './AlbumView';
import ArtistView from './ArtistView';

export default function MainContent() {
  const { view } = useSpotify();

  const renderView = () => {
    switch (view.type) {
      case 'home':     return <HomeView />;
      case 'search':   return <SearchView />;
      case 'playlist': return <PlaylistView id={view.id} />;
      case 'liked':    return <LikedView />;
      case 'album':    return <AlbumView id={view.id} />;
      case 'artist':   return <ArtistView id={view.id} />;
      default:         return <HomeView />;
    }
  };

  return (
    <main className="flex-1 min-w-0 rounded-lg bg-[#121212] overflow-hidden">
      {renderView()}
    </main>
  );
}
