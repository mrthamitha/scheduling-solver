/**
 * api/index.js — Vercel Function එකේ entry point එක.
 * ==================================================================
 * Vercel එකේ /api/* කියන හැම request එකකුත් මෙතනට එනවා
 * (vercel.json එකේ තියෙන rewrite එකෙන්). ඊට පස්සේ අපේ Express app එක
 * ඒක හරියටම handle කරනවා — වෙනසක් නෑ, ඒකම code එක!
 * ==================================================================
 */
import app from '../server/src/app.js';

export default app;