/** "0 1 2 3" වගේ text එකක් number array එකකට හරවනවා. */
export function parseNumbers(text) {
  const parts = String(text).trim().split(/[\s,]+/).filter(Boolean);
  return parts.map((part) => {
    const n = Number(part);
    if (!Number.isFinite(n)) throw new Error(`"${part}" is not a number.`);
    return n;
  });
}