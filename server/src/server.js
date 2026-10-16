/**
 * server.js — local හෝ Render සඳහා "server එක" — app එකට listen කරනවා විතරයි.
 * (Vercel එකේදී මේක පාවිච්චි වෙන්නේ නෑ — එතන api/index.js එකෙන් app එක
 *  කෙලින්ම function එකක් විදිහට run වෙනවා.)
 */
import app from './app.js';

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`✅ API listening on http://localhost:${port}`);
});