/**
 * server.js — Express app එකේ පිවිසුම් දොර
 * ==================================================================
 * මේ file එකේ අපි කරන්නේ "wiring" එක විතරයි:
 *   middleware → routes → error handling → listen
 * Algorithm logic එක මෙතන නෑ (ඒක algorithms/ වල), route logic එකත් නෑ
 * (ඒක routes/ වල). එහෙම තියෙන එකයි හොඳ design එක.
 * ==================================================================
 */
import express from 'express';
import cors from 'cors';
import solveRouter from './routes/solve.js';

const app = express();

/* ── 1) Middleware ─────────────────────────────────────────
 * cors  : වෙනත් origin එකකින් (උදා: React dev server :5173) එන requests allow කරනවා
 * json  : request body එක JSON කියලා කියනවා + size limit එකක්
 */
app.use(cors());
app.use(express.json({ limit: '200kb' }));

/* ── 2) Health check — "server එක ජීවත්ද?" ───────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* ── 3) API routes ────────────────────────────────────────── */
app.use('/api', solveRouter);    // /api/algorithms + /api/solve

/* ── 4) 404 — ඉල්ලපු route එකක් නැත්නම් ─────────────────── */
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

/* ── 5) Error handler ───────────────────────────────────────
 * ⚠️ arguments 4ක් තියෙන්න ඕන (err, req, res, next) — Express ඒකෙන් තමයි
 *    "මේක error handler එකක්" කියලා අඳුනගන්නේ. `next` පාවිච්චි නොකළත්
 *    අයින් කරන්න එපා!
 */
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message ?? 'Something went wrong.' });
});

/* ── 6) Listen ─────────────────────────────────────────────── */
const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`✅ API listening on http://localhost:${port}`);
});