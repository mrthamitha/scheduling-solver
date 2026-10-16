/**
 * routes/solutions.js
 * ==================================================================
 * Save & share feature එක.
 *   POST /api/solutions      -> input + result save කරලා id එකක් දෙනවා
 *   GET  /api/solutions/:id  -> ඒ id එකේ solution එක ආපහු දෙනවා
 *
 * Frontend එකේ /s/<id> කියන URL එකට ගියාම, app එක මේ GET එක
 * කරලා කලින් solve කරපු එක ආයෙත් පෙන්නනවා. (මේක තමයි share link එක.)
 *
 * 📌 error එකක් ආවම කෙලින්ම status code + { error } JSON එක යවනවා.
 *    ඒ නිසා util/errors.js එකේ classes මෙතන ඕන නෑ — file එක
 *    තනියම ඉන්නවා (self-contained).
 * ==================================================================
 */

import { Router } from 'express';
import { saveSolution, getSolution } from '../store.js';

const router = Router();

router.post('/', (req, res) => {
  const { input, result } = req.body ?? {};
  if (!input) {
    return res
      .status(400) // Bad Request — user ගේ input එකේ ප්‍රශ්නයක්
      .json({ error: '"input" is required — save the solver input you want to share.' });
  }

  const id = saveSolution(input, result ?? null);
  res.status(201).json({ id, shareUrl: `/s/${id}` }); // 201 = අලුත් දෙයක් හැදුනා
});

router.get('/:id', (req, res) => {
  const solution = getSolution(req.params.id);
  if (!solution) {
    return res.status(404).json({ error: 'No saved solution with that id.' });
  }
  res.json(solution);
});

export default router;