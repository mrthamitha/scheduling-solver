/**
 * api/index.js — Vercel Function එකේ පිවිසුම් දොර (entry point).
 * ==================================================================
 * Vercel එකේ /api/* කියන හැම request එකකුත් මෙතනට එනවා
 * (vercel.json එකේ තියෙන rewrite එකෙන්). ඊට පස්සේ අපේ Express app
 * එක ඒක හරියටම handle කරනවා — ඒකම code එක, වෙනසක් නෑ.
 *
 * 📌 පාඩම: Vercel එක rewrite කරද්දී capture group එක (`$1`) query
 *    parameter එකක් විදිහට එවන නිසා, ඇත්ත path එක මෙතනින් ආයෙත්
 *    හදාගන්නවා. එතකොට Express එකට හැමවෙලේම "/api/solve" වගේ
 *    සම්පූර්ණ path එක ලැබෙනවා — route එක නොවැරදී match වෙනවා.
 * ==================================================================
 */

import app from '../server/src/app.js';

export default function handler(req, res) {
  const url = new URL(req.url, 'http://localhost'); // rewrite එකෙන් ආපු path එක
  const rest = url.searchParams.get('path');

  if (rest) {
    url.searchParams.delete('path'); // අපේ path එක විතරයි ඉතුරු කරන්න
    const query = url.searchParams.toString();
    req.url = `/api/${rest}${query ? `?${query}` : ''}`;
  }

  return app(req, res); // Express app එකට භාර දෙනවා
}