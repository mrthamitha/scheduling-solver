/**
 * server.js — දේශීයව (local) server එක ධාවනය කරන තැන.
 * ==================================================================
 * Express app එක හදන code එක ඔක්කොම app.js එකේ තියෙනවා.
 * මෙතන කරන්නේ ඒක import කරලා, port එකක් උඩ listen කරන එක විතරයි.
 *
 * ධාවනය කරන්න:
 *   npm start        (root එකෙන් — production build + server)
 *
 * Vercel එකේදී මේක ධාවනය වෙන්නේ නෑ —
 * එතන api/index.js එකට කෙලින්ම app.js එක import වෙනවා.
 * ==================================================================
 */

import app from './app.js';

const port = process.env.PORT ?? 4000; // hosting services PORT එක දෙනවා
app.listen(port, () => {
  console.log(`✅ API listening on http://localhost:${port}`);
  console.log(`   try: http://localhost:${port}/api/health`);
});