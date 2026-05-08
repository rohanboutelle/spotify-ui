import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { spotify } from '../lib/spotify';
import { isLoggedIn } from '../lib/auth';

const SpotifyContext = createContext(null);

export function SpotifyProvider({ children }) {
  const [user, setUser] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [view, setView] = useState({ type: 'home' }); // {type, id, data}
  const [queue, setQueue] = useState([]);
  const [sdkReady, setSdkReady] = useState(false);
  const pollRef = useRef(null);

  // Init SDK
  useEffect(() => {
    if (!isLoggedIn()) return;

    const initPlayer = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Spotify Web Player',
        getOAuthToken: async (cb) => {
          const { getAccessToken, isTokenExpired, refreshAccessToken } = await import('../lib/auth');
          if (isTokenExpired()) {
            try {
              const token = await refreshAccessToken();
              cb(token);
            } catch {
              cb('');
            }
          } else {
            cb(getAccessToken());
          }
        },
        volume: 0.5,
      });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        setSdkReady(true);
        spotify.transferPlayback(device_id, false).catch(() => {});
      });

      spotifyPlayer.addListener('not_ready', () => {
        setSdkReady(false);
      });

      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;
        setPlayerState(state);
      });

      spotifyPlayer.addListener('authentication_error', () => {});
      spotifyPlayer.addListener('account_error', () => {});

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    }

    return () => {
      if (player) player.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch user info + playlists
  useEffect(() => {
    if (!isLoggedIn()) return;
    spotify.getMe().then(setUser).catch(() => {});
    spotify.getUserPlaylists(50).then(d => setPlaylists(d?.items || [])).catch(() => {});
  }, []);

  // Poll playback state every 3s to keep track info and play/pause fresh
  useEffect(() => {
    if (!isLoggedIn()) return;

    const poll = async () => {
      try {
        const state = await spotify.getPlaybackState();
        if (state) setPlayerState(state);
      } catch (_) {}
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, []);

  const refreshPlaybackState = useCallback(async () => {
    try {
      const state = await spotify.getPlaybackState();
      if (state) setPlayerState(state);
    } catch (_) {}
  }, []);

  const playTrack = useCallback(async (uri, contextUri = null, offset = null) => {
    try {
      const body = {};
      if (contextUri) {
        body.context_uri = contextUri;
        if (offset !== null) body.offset = { position: offset };
      } else if (uri) {
        body.uris = [uri];
      }
      await spotify.play(deviceId, body);
      setTimeout(refreshPlaybackState, 300);
    } catch (err) {
      console.error('Play error:', err);
    }
  }, [deviceId, refreshPlaybackState]);

  const togglePlay = useCallback(async () => {
    if (player) {
      await player.togglePlay();
    } else {
      try {
        if (playerState?.is_playing) {
          await spotify.pause();
        } else {
          await spotify.play(deviceId);
        }
        setTimeout(refreshPlaybackState, 300);
      } catch (_) {}
    }
  }, [player, playerState, deviceId, refreshPlaybackState]);

  const skipNext = useCallback(async () => {
    try {
      await spotify.next();
      setTimeout(refreshPlaybackState, 500);
    } catch (_) {}
  }, [refreshPlaybackState]);

  const skipPrevious = useCallback(async () => {
    try {
      await spotify.previous();
      setTimeout(refreshPlaybackState, 500);
    } catch (_) {}
  }, [refreshPlaybackState]);

  const seek = useCallback(async (ms) => {
    try {
      await spotify.seek(ms);
    } catch (_) {}
  }, []);

  const setVolume = useCallback(async (pct) => {
    try {
      if (player) await player.setVolume(pct / 100);
      await spotify.setVolume(pct);
    } catch (_) {}
  }, [player]);

  const toggleShuffle = useCallback(async () => {
    const current = playerState?.shuffle_state ?? false;
    try {
      await spotify.setShuffle(!current);
      setPlayerState(prev => prev ? { ...prev, shuffle_state: !current } : prev);
    } catch (_) {}
  }, [playerState]);

  const cycleRepeat = useCallback(async () => {
    const modes = ['off', 'context', 'track'];
    const current = playerState?.repeat_state || 'off';
    const next = modes[(modes.indexOf(current) + 1) % modes.length];
    try {
      await spotify.setRepeat(next);
      setPlayerState(prev => prev ? { ...prev, repeat_state: next } : prev);
    } catch (_) {}
  }, [playerState]);

  const fetchQueue = useCallback(async () => {
    try {
      const data = await spotify.getQueue();
      setQueue(data?.queue || []);
    } catch (_) {}
  }, []);

  const value = {
    user,
    deviceId,
    player,
    playerState,
    sdkReady,
    playlists,
    queue,
    view,
    setView,
    playTrack,
    togglePlay,
    skipNext,
    skipPrevious,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    fetchQueue,
    refreshPlaybackState,
  };

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}

export function useSpotify() {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error('useSpotify must be inside SpotifyProvider');
  return ctx;
}
