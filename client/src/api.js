// api.js — backend එකට කතා කරන එකම තැන
// (පස්සේ deploy කරද්දී VITE_API_URL එකෙන් වෙන URL එකක් දෙන්න පුළුවන්)
const BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, options);
  } catch {
    throw new Error('Cannot reach the API. Is the server running on port 4000?');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data;
}

export const getAlgorithms = () => request('/api/algorithms');

export const solve = (body) =>
  request('/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
export const saveSolution = (payload) =>
  request('/api/solutions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // ← headers එක මෙතනම දානවා
    body: JSON.stringify(payload),
  });
  export const getSolution = (id) => request(`/api/solutions/${id}`);