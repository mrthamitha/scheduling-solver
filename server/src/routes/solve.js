/**
 * routes/solve.js — HTTP layer එක
 * ==================================================================
 * මෙතන වැඩ දෙකක් වෙනවා:
 *   1) User ගේ input එක validate කරනවා (අපි විශ්වාස කරන්නේ නෑ!)
 *   2) Algorithm function එකට යවලා, result එක JSON විදිහට යවනවා
 *
 * ⚠️ client-side validation තිබ්බත්, server එකේ validation එක **අනිවාර්යයි**
 *    — ඕනෑම කෙනෙක් curl / Postman එකෙන් කෙලින්ම API එකට කතා කරන්න පුළුවන් නිසා.
 * ==================================================================
 */

import { Router } from 'express';
import { runCpu, CPU_ALGOS } from '../algorithms/cpu.js';
import { runDisk, DISK_ALGOS } from '../algorithms/disk.js';

/** User ගේ වැරැද්දක් නම් status 400 — error handler එක ඒක බලලා යවනවා. */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

const router = Router();
const MAX_CPU_PROCESSES = 12;
const MAX_DISK_REQUESTS = 14;

/* ── GET /api/algorithms — frontend dropdown එකට list එක ── */
router.get('/algorithms', (req, res) => {
  res.json({ cpu: CPU_ALGOS, disk: DISK_ALGOS });
});

/* ── POST /api/solve ──
 * CPU : { type:'cpu',  algorithm, processes:[{pid?,at,bt,pr?}], quantum? }
 * Disk: { type:'disk', algorithm, requests:[98,183,...], head, direction?, maxCylinder? }
 */
router.post('/solve', (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (body.type === 'cpu') return res.json(solveCpu(body));
    if (body.type === 'disk') return res.json(solveDisk(body));
    throw new ValidationError('"type" must be either "cpu" or "disk".');
  } catch (err) {
    next(err);   // -> error handler එක status එක බලලා JSON යවනවා
  }
});

/* ══════════════ validation helpers ══════════════ */

function checkNumbers(values, label, { min = 0, max = Infinity, maxCount } = {}) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new ValidationError(`${label} must be a non-empty array of numbers.`);
  }
  if (maxCount && values.length > maxCount) {
    throw new ValidationError(`${label}: maximum ${maxCount} values for a readable chart.`);
  }
  values.forEach((value, i) => {
    if (!Number.isInteger(value) || value < min || value > max) {
      throw new ValidationError(`${label}[${i}] must be a whole number between ${min} and ${max}.`);
    }
  });
}

function findAlgo(list, id, kind) {
  const algo = list.find((a) => a.id === id);
  if (!algo) {
    throw new ValidationError(`Unknown ${kind} algorithm "${id}". Use /api/algorithms to see the valid ids.`);
  }
  return algo;
}

/* ══════════════ CPU ══════════════ */

function solveCpu(body) {
  const algo = findAlgo(CPU_ALGOS, body.algorithm, 'CPU');
  const processes = body.processes;

  if (!Array.isArray(processes) || processes.length === 0) {
    throw new ValidationError('processes must be a non-empty array.');
  }
  checkNumbers(processes.map((p) => p.at), 'arrival times', { max: 100000, maxCount: MAX_CPU_PROCESSES });
  checkNumbers(processes.map((p) => p.bt), 'burst times', { min: 1, max: 10000, maxCount: MAX_CPU_PROCESSES });

  const hasPriorities = processes.every((p) => Number.isInteger(p.pr));
  if (algo.needsPriority && !hasPriorities) {
    throw new ValidationError('This algorithm needs a priority for every process (smaller number = higher priority).');
  }

  let quantum;
  if (algo.needsQuantum) {
    quantum = Number(body.quantum ?? 2);
    if (!Number.isInteger(quantum) || quantum < 1) {
      throw new ValidationError('Time quantum must be a whole number of 1 or more.');
    }
  }

  const normalised = processes.map((p, i) => ({
    pid: p.pid ?? `P${i + 1}`,
    at: p.at,
    bt: p.bt,
    pr: Number.isInteger(p.pr) ? p.pr : 0,
  }));

  const result = runCpu(algo.id, normalised, { quantum });

  // 🎓 comparison එකත් server එකේම ගණනය කරනවා — frontend එකට algorithm code එකක්වත්
  //    දැනගන්න ඕන නෑ. ඒකයි fullstack වල ලස්සන: business logic එක එක තැනක.
  const comparison = CPU_ALGOS.map((a) => {
    if (a.needsPriority && !hasPriorities) {
      return { id: a.id, name: a.short, applicable: false, reason: 'Needs priorities' };
    }
    const run = runCpu(a.id, normalised, { quantum: quantum ?? 2 });
    return {
      id: a.id, name: a.short, applicable: true,
      avgWaiting: run.metrics.avgWaiting,
      avgTurnaround: run.metrics.avgTurnaround,
      avgResponse: run.metrics.avgResponse,
      contextSwitches: run.metrics.contextSwitches,
      utilisation: run.metrics.utilisation,
    };
  });

  return {
    ...result,
    type: 'cpu',        // ⚠️ spread එකට පස්සේ! (නැත්නම් result එකේ key එකකින් overwrite වෙනවා)
    algorithm: algo.id,
    algorithmName: algo.name,
    quantum,
    comparison,
  };
}

/* ══════════════ DISK ══════════════ */

function solveDisk(body) {
  const algo = findAlgo(DISK_ALGOS, body.algorithm, 'disk');
  const requests = body.requests;

  checkNumbers(requests, 'requests', { max: 100000, maxCount: MAX_DISK_REQUESTS });

  const head = Number(body.head);
  const maxCylinder = Number(body.maxCylinder ?? 199);

  if (!Number.isInteger(head) || head < 0) throw new ValidationError('"head" must be a whole number of 0 or more.');
  if (!Number.isInteger(maxCylinder) || maxCylinder < 10) throw new ValidationError('"maxCylinder" must be a whole number of 10 or more.');
  if (head > maxCylinder) throw new ValidationError(`"head" must be between 0 and ${maxCylinder}.`);
  if (requests.some((r) => r > maxCylinder)) {
    throw new ValidationError(`Every request must be between 0 and ${maxCylinder}.`);
  }

  const direction = body.direction === 'left' ? 'left' : 'right';
  const result = runDisk(algo.id, requests, head, { direction, maxCylinder });

  const comparison = DISK_ALGOS.map((a) => {
    const run = runDisk(a.id, requests, head, { direction, maxCylinder });
    return { id: a.id, name: a.id.toUpperCase(), applicable: true, total: run.total, average: run.average, order: run.order };
  });

  return {
    ...result,
    type: 'disk',
    algorithm: algo.id,
    algorithmName: algo.name,
    direction,
    comparison,
  };
}

export default router;