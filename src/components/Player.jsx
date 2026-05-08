import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Volume1, List, Mic2, Maximize2
} from 'lucide-react';
import { useSpotify } from '../context/SpotifyContext';

function formatMs(ms) {
  if (!ms) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function Player() {
  const {
    playerState,
    togglePlay,
    skipNext,
    skipPrevious,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    fetchQueue,
  } = useSpotify();

  const [progress, setProgress] = useState(0);
  const [volume, setLocalVolume] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const intervalRef = useRef(null);
  const lastStateRef = useRef(null);

  const track = playerState?.item;
  const isPlaying = playerState?.is_playing;
  const duration = track?.duration_ms || 0;
  const shuffleOn = playerState?.shuffle_state;
  const repeatMode = playerState?.repeat_state || 'off';

  // Sync progress from state
  useEffect(() => {
    if (!playerState) return;
    if (lastStateRef.current?.item?.id !== playerState?.item?.id) {
      setProgress(playerState.progress_ms || 0);
    }
    lastStateRef.current = playerState;
  }, [playerState]);

  // Tick progress locally
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (!dragging) {
          setProgress(prev => Math.min(prev + 1000, duration));
        }
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, duration, dragging]);

  const handleSeek = useCallback((e) => {
    const pct = parseFloat(e.target.value);
    const ms = Math.floor((pct / 100) * duration);
    setProgress(ms);
    seek(ms);
  }, [duration, seek]);

  const handleVolumeChange = useCallback((e) => {
    const v = parseInt(e.target.value, 10);
    setLocalVolume(v);
    setVolume(v);
  }, [setVolume]);

  const progressPct = duration ? (progress / duration) * 100 : 0;

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  const RepeatIcon = repeatMode === 'track' ? Repeat1 : Repeat;

  return (
    <div className="flex items-center justify-between h-[90px] px-4 bg-[#181818] border-t border-white/10">
      {/* Track info */}
      <div className="flex items-center gap-3 w-[30%] min-w-0">
        {track ? (
          <>
            {track.album?.images?.[0] ? (
              <img
                src={track.album.images[0].url}
                alt={track.name}
                className="w-14 h-14 rounded object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded bg-[#282828] shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
                {track.name}
              </div>
              <div className="text-xs text-[#B3B3B3] truncate hover:underline cursor-pointer">
                {track.artists?.map(a => a.name).join(', ')}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded bg-[#282828]" />
            <div>
              <div className="w-24 h-3 bg-[#282828] rounded mb-2" />
              <div className="w-16 h-2 bg-[#282828] rounded" />
            </div>
          </div>
        )}
      </div>

      {/* Center: controls + seek */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-[40%]">
        {/* Playback buttons */}
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${shuffleOn ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>

          <button
            onClick={skipPrevious}
            className="text-[#B3B3B3] hover:text-white transition-colors"
            title="Previous"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 bg-white hover:scale-105 rounded-full flex items-center justify-center transition-transform"
          >
            {isPlaying ? (
              <Pause size={16} className="text-black fill-black" />
            ) : (
              <Play size={16} className="text-black fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={skipNext}
            className="text-[#B3B3B3] hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`relative transition-colors ${repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}
            title={`Repeat: ${repeatMode}`}
          >
            <RepeatIcon size={16} />
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1DB954] rounded-full" />
            )}
          </button>
        </div>

        {/* Seek bar */}
        <div className="seek-bar flex items-center gap-2 w-full">
          <span className="text-xs text-[#B3B3B3] w-8 text-right tabular-nums">{formatMs(progress)}</span>
          <div className="flex-1 relative group">
            <div className="h-1 bg-[#555] rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full group-hover:bg-[#1DB954] transition-colors"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progressPct}
              onChange={handleSeek}
              onMouseDown={() => setDragging(true)}
              onMouseUp={() => setDragging(false)}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs text-[#B3B3B3] w-8 tabular-nums">{formatMs(duration)}</span>
        </div>
      </div>

      {/* Right: extras */}
      <div className="flex items-center gap-3 w-[30%] justify-end">
        <button
          onClick={() => {
            setShowQueue(v => !v);
            if (!showQueue) fetchQueue();
          }}
          className={`transition-colors ${showQueue ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}
          title="Queue"
        >
          <List size={16} />
        </button>

        {/* Volume */}
        <div className="volume-bar flex items-center gap-2">
          <button
            onClick={() => {
              const newVol = volume > 0 ? 0 : 50;
              setLocalVolume(newVol);
              setVolume(newVol);
            }}
            className="text-[#B3B3B3] hover:text-white transition-colors"
          >
            <VolumeIcon size={16} />
          </button>
          <div className="relative w-24 group">
            <div className="h-1 bg-[#555] rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full group-hover:bg-[#1DB954] transition-colors"
                style={{ width: `${volume}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
