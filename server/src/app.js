/**
 * app.js — Express app එක (routes + middleware ඔක්කොම මෙතන)
 * ==================================================================
 * මේ file එකේ තියෙන්නේ app එක **හදන** code එක විතරයි — listen
 * කරන කොටස නෑ. ඒ නිසා මේක ඕන තැනකින් පාවිච්චි කරන්න පුළුවන්:
 *   - දේශීයව: server.js එක import කරලා listen කරනවා
 *   - Vercel: api/index.js එක import කරලා function එකක් විදිහට දෙනවා
 * ==================================================================
 */

import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import solveRouter from './routes/solve.js';
import solutionsRouter from './routes/solutions.js';

// මේ file එක තියෙන තැනින් client/dist එක හොයාගන්නවා
// (server/src/app.js -> ../../client/dist)
const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(here, '../../client/dist');

const app = express();

/* ------------------------------------------------------------------
 * MIDDLEWARE — හැම request එකකටත් කලින් ධාවනය වෙන කෑලි
 * ------------------------------------------------------------------ */

// 1) CORS: dev කාලයේ React app එක (:5173) සහ API එක (:4000)
//    වෙනස් ports නිසා browser එක "block" කරනවා. cors() එකෙන් ඒක අවසර දෙනවා.
//    (production එකේ එකම server එකෙන් දෙකම serve කරාම මේක අවශ්‍ය නෑ.)
app.use(cors());

// 2) express.json(): request body එකේ JSON එක JavaScript object එකක් බවට හරවනවා.
//    මේක නැතිව req.body එක undefined වෙනවා — beginners ලා වැඩිපුරම අහුවෙන තැනක්!
app.use(express.json({ limit: '200kb' }));

/* ------------------------------------------------------------------
 * ROUTES
 * ------------------------------------------------------------------ */

// Server එක ජීවතුන් අතරද කියලා බලන්න — deploy කරාට පස්සේ check කරන්නත් පාවිච්චි කරනවා.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api', solveRouter);              // /api/algorithms, /api/solve
app.use('/api/solutions', solutionsRouter); // /api/solutions, /api/solutions/:id

/* ------------------------------------------------------------------
 * PHASE 7 (deploy) — STATIC FILES
 * build කරපු React app එක (client/dist) මෙතනින් serve කරනවා.
 * Vercel එකේදී මේ folder එක function එක ඇතුළේ නැති නිසා,
 * තියෙනවා නම් විතරක් serve කරනවා (existsSync check එක).
 * දේශීයව (localhost:4000) build එක තියෙනවා නම්, ඒක මෙතනින් දෙනවා.
 * ------------------------------------------------------------------ */
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next(); // API route එකක් නම් අල්ලන්නේ නෑ
    res.sendFile(path.join(clientDist, 'index.html')); // SPA deep links
  });
}

/* ------------------------------------------------------------------
 * ERROR HANDLER — හැම error එකකුත් මෙතනට එනවා (arguments 4ක් තියෙන
 * නිසා Express එක මේකව error handler එකක් විදිහට හඳුනාගන්නවා).
 * එකම තැනකින් error JSON එකක් හදන නිසා frontend එකට හැමවෙලේම
 * { error: "..." } කියන හැඩය ලැබෙනවා. මේකත් API design එකේ කොටසක්.
 * ------------------------------------------------------------------ */
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err); // අපේ වැරැද්දක් නම් log කරනවා
  res.status(status).json({ error: err.message || 'Something went wrong.' });
});

export default app;