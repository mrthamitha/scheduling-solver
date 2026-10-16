/**
 * store.js — saved solutions (Phase 3 version: memory එකේ විතරයි)
 * ==================================================================
 * මේක Map එකක්. Server එක restart වුනාම data නැති වෙනවා — ඒක
 * හිතාමතාම! මුලින්ම API + frontend එක වැඩ කරවන්න මේක ඇති.
 *
 * 👉 PHASE 4 (database) එකේදී මේ file එකේ functions දෙකම
 *    SQLite එකෙන් ලියනවා. එතකොට routes/solutions.js එකට
 *    කිසිම වෙනසක් කරන්න ඕන නෑ — හේතුව ඒක import කරන්නේ
 *    functions දෙකක් විතරයි. මේකට කියන්නේ "swap the storage layer".
 * ==================================================================
 */

import { randomBytes } from 'node:crypto';

const solutions = new Map();

/** අලුත් solution එකක් save කරලා කෙටි id එකක් ආපහු දෙනවා (share link එකට). */
export function saveSolution(input, result) {
  const id = randomBytes(4).toString('hex'); // උදා: "9f3c1a7b"
  solutions.set(id, {
    id,
    input,
    result,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export function getSolution(id) {
  return solutions.get(id) ?? null;
}

export function countSolutions() {
  return solutions.size;
}