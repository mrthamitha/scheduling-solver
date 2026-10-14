/** "0 1 2 3" වගේ text එකක් number array එකකට හරවනවා. */
export function parseNumbers(text) {
  const parts = String(text).trim().split(/[\s,]+/).filter(Boolean);
  return parts.map((part) => {
    const n = Number(part);
    if (!Number.isFinite(n)) throw new Error(`"${part}" is not a number.`);
    return n;
  });
}

/** Process එකකට ලස්සන color එකක් — හැම එකකටම වෙනස්. */
export const PALETTE = [
  '#4c8dff', '#2dd4bf', '#f59e0b', '#a78bfa', '#f472b6',
  '#34d399', '#60a5fa', '#fb923c', '#38bdf8', '#c084fc',
];

export function buildColorMap(pids) {
  const map = {};
  pids.forEach((pid, i) => {
    map[pid] = PALETTE[i % PALETTE.length];
  });
  return map;
}

/** 5.25 -> "5.25" · 5 -> "5" */
export const formatNumber = (value) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);