/**
 * app.js — Express app එක (listen එක නැතුව)
 * ==================================================================
 * මේ file එකේ "server එකක්" නෑ — app එක විතරයි.
 * එහෙම කරන්නේ ඇයි? මොකද app එක **විවිධ තැන්වලින්** පාවිච්චි කරන්න
 * පුළුවන් නිසා:
 *   - server.js        → local / Render එකේදී listen කරනවා
 *   - api/index.js     → Vercel Function එකක් විදිහට වැඩ කරනවා
 * ==================================================================
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import solveRouter from './routes/solve.js';

const app = express();

/* ── 1) Middleware ─────────────────────────────────────────── */
app.use(cors());
app.use(express.json({ limit: '200kb' }));

/* ── 2) Health check ──────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* ── 3) API routes ─────────────────────────────────────────── */
app.use('/api', solveRouter);    // /api/algorithms + /api/solve

/* ── 4) Local / Render: build කරපු React app එකත් serve කරනවා ──
 * (Vercel එකේදී client/dist නෑ → මේ block එක skip වෙනවා —
 *  එතන static files Vercel එකම serve කරන නිසා.)
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(here, '../../client/dist');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log(`📦 Serving client build from ${clientDist}`);
}

/* ── 5) 404 ───────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

/* ── 6) Error handler (arguments 4ක් ඕන!) ──────────────────── */
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message ?? 'Something went wrong.' });
});

export default app;