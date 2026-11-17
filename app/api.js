const origin = 'https://make.fun/api';
const cache = new Map();
const pending = new Map();

export async function get(path, refresh = false) {
  const saved = cache.get(path);
  if (!refresh && saved && Date.now() - saved.checked < 20000) return saved.data;
  if (pending.has(path)) return pending.get(path);
  const request = (async () => {
    try {
      const headers = saved?.etag ? { 'If-None-Match': saved.etag } : {};
      const response = await fetch(origin + path, { method: 'GET', headers, signal: AbortSignal.timeout(30000) });
      if (response.status === 304 && saved) {
        saved.checked = Date.now();
        return saved.data;
      }
      if (!response.ok) {
        const error = new Error(response.status === 404 ? 'Not found' : 'The live data could not be loaded. Please try again.');
        error.status = response.status;
        throw error;
      }
      const data = await response.json();
      cache.set(path, { data, etag: response.headers.get('etag'), checked: Date.now() });
      return data;
    } finally { pending.delete(path); }
  })();
  pending.set(path, request);
  return request;
}

export const getBounties = () => get('/competitions?status=open&activity=times');
export const getBounty = slug => get('/competitions/' + encodeURIComponent(slug));
export const getLeaderboard = slug => get('/competitions/' + encodeURIComponent(slug) + '/leaderboard');
export const getProfile = handle => get('/profiles/' + encodeURIComponent(handle));
