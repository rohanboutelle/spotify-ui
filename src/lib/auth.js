const CLIENT_ID = '2851641ba9cd477cbfa7d84bd992f8c1';
const REDIRECT_URI = 'https://egan-spotify.netlify.app/callback';

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'user-library-modify',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-read-recently-played',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ');

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, x => chars[x % chars.length]).join('');
}

async function sha256(plain) {
  const data = new TextEncoder().encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

function base64urlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  bytes.forEach(b => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function initiateLogin() {
  const verifier = generateRandomString(128);
  const challenge = base64urlEncode(await sha256(verifier));
  sessionStorage.setItem('pkce_verifier', verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleCallback(code) {
  const verifier = sessionStorage.getItem('pkce_verifier');

  const res = await fetch('/spotify/auth/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) throw new Error('Token exchange failed');
  const data = await res.json();
  storeTokens(data);
  sessionStorage.removeItem('pkce_verifier');
  return data;
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  if (!refreshToken) throw new Error('No refresh token available');

  const res = await fetch('/spotify/auth/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    logout();
    throw new Error('Token refresh failed');
  }

  const data = await res.json();
  storeTokens(data);
  return data.access_token;
}

function storeTokens(data) {
  localStorage.setItem('spotify_access_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
  localStorage.setItem('spotify_token_expiry', String(Date.now() + data.expires_in * 1000));
}

export function getAccessToken() {
  return localStorage.getItem('spotify_access_token');
}

export function getRefreshToken() {
  return localStorage.getItem('spotify_refresh_token');
}

export function isTokenExpired() {
  const expiry = localStorage.getItem('spotify_token_expiry');
  if (!expiry) return true;
  return Date.now() > parseInt(expiry, 10) - 60_000;
}

export function isLoggedIn() {
  return !!(getAccessToken() && getRefreshToken());
}

export function logout() {
  ['spotify_access_token', 'spotify_refresh_token', 'spotify_token_expiry'].forEach(k =>
    localStorage.removeItem(k)
  );
}
