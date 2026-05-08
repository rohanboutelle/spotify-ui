import Sidebar from './Sidebar';
import MainContent from './MainContent';
import Player from './Player';
import NowPlayingBar from './NowPlayingBar';

export default function Layout() {
  return (
    <div className="flex flex-col h-screen bg-[#121212] select-none">
      {/* Main area: sidebar + content */}
      <div className="flex flex-1 min-h-0 gap-2 p-2 pb-0">
        <Sidebar />
        <MainContent />
        <NowPlayingBar />
      </div>

      {/* Player bar */}
      <div className="flex-shrink-0">
        <Player />
      </div>
    </div>
  );
}
