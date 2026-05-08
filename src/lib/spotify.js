import { getAccessToken, isTokenExpired, refreshAccessToken } from './auth';

const BASE = '/spotify/api';

let tokenPromise = null;

async function getToken() {
  if (isTokenExpired()) {
    if (!tokenPromise) {
      tokenPromise = refreshAccessToken().finally(() => {
        tokenPromise = null;
      });
    }
    return tokenPromise;
  }
  return getAccessToken();
}

async function apiFetch(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 204) return null;

  if (!res.ok) {
    let msg = `Spotify API error ${res.status}`;
    try {
      const err = await res.json();
      msg = err.error?.message || msg;
    } catch (_) {}
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

export const spotify = {
  // ── User ──────────────────────────────────────────────────────────────────
  getMe: () => apiFetch('/me'),

  // ── Player state ──────────────────────────────────────────────────────────
  getPlaybackState: () => apiFetch('/me/player'),
  getDevices: () => apiFetch('/me/player/devices'),

  transferPlayback: (deviceId, play = true) =>
    apiFetch('/me/player', {
      method: 'PUT',
      body: JSON.stringify({ device_ids: [deviceId], play }),
    }),

  // ── Playback controls ─────────────────────────────────────────────────────
  play: (deviceId, body = {}) =>
    apiFetch(`/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  pause: () => apiFetch('/me/player/pause', { method: 'PUT' }),
  next: () => apiFetch('/me/player/next', { method: 'POST' }),
  previous: () => apiFetch('/me/player/previous', { method: 'POST' }),

  seek: (ms) => apiFetch(`/me/player/seek?position_ms=${ms}`, { method: 'PUT' }),
  setVolume: (pct) => apiFetch(`/me/player/volume?volume_percent=${pct}`, { method: 'PUT' }),
  setShuffle: (state) => apiFetch(`/me/player/shuffle?state=${state}`, { method: 'PUT' }),
  setRepeat: (state) => apiFetch(`/me/player/repeat?state=${state}`, { method: 'PUT' }),

  getQueue: () => apiFetch('/me/player/queue'),

  // ── Library ───────────────────────────────────────────────────────────────
  getRecentlyPlayed: (limit = 20) =>
    apiFetch(`/me/player/recently-played?limit=${limit}`),

  getTopTracks: (limit = 20, range = 'short_term') =>
    apiFetch(`/me/top/tracks?limit=${limit}&time_range=${range}`),

  // ── Playlists ─────────────────────────────────────────────────────────────
  getUserPlaylists: (limit = 50, offset = 0) =>
    apiFetch(`/me/playlists?limit=${limit}&offset=${offset}`),

  getPlaylist: (id) => apiFetch(`/playlists/${id}`),

  getPlaylistTracks: (id, limit = 50, offset = 0) =>
    apiFetch(`/playlists/${id}/tracks?limit=${limit}&offset=${offset}`),

  // ── Search ────────────────────────────────────────────────────────────────
  search: (q, types = ['track', 'artist', 'album', 'playlist'], limit = 20) =>
    apiFetch(`/search?q=${encodeURIComponent(q)}&type=${types.join(',')}&limit=${limit}`),

  // ── Albums ────────────────────────────────────────────────────────────────
  getAlbum: (id) => apiFetch(`/albums/${id}`),
  getAlbumTracks: (id, limit = 50) => apiFetch(`/albums/${id}/tracks?limit=${limit}`),

  // ── Artists ───────────────────────────────────────────────────────────────
  getArtist: (id) => apiFetch(`/artists/${id}`),
  getArtistTopTracks: (id, market = 'US') =>
    apiFetch(`/artists/${id}/top-tracks?market=${market}`),
  getArtistAlbums: (id, limit = 20) =>
    apiFetch(`/artists/${id}/albums?limit=${limit}&include_groups=album,single`),

  // ── Browse ────────────────────────────────────────────────────────────────
  getFeaturedPlaylists: (limit = 8) =>
    apiFetch(`/browse/featured-playlists?limit=${limit}`),

  getNewReleases: (limit = 8) =>
    apiFetch(`/browse/new-releases?limit=${limit}`),

  // ── Saved tracks ──────────────────────────────────────────────────────────
  getSavedTracks: (limit = 50, offset = 0) =>
    apiFetch(`/me/tracks?limit=${limit}&offset=${offset}`),

  checkSavedTracks: (ids) =>
    apiFetch(`/me/tracks/contains?ids=${ids.join(',')}`),

  saveTracks: (ids) =>
    apiFetch('/me/tracks', { method: 'PUT', body: JSON.stringify({ ids }) }),

  removeSavedTracks: (ids) =>
    apiFetch('/me/tracks', { method: 'DELETE', body: JSON.stringify({ ids }) }),
};
