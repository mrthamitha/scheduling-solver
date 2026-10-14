import { runCpu } from './algorithms/cpu.js';

const show = (name, res) => {
  console.log(`\n=== ${name} ===`);
  console.log('Gantt:    ', res.gantt.map((b) => `${b.idle ? 'Idle' : b.pid}:${b.start}-${b.end}`).join('  '));
  console.log('Waiting:  ', res.processes.map((p) => `${p.pid}=${p.waiting}`).join('  '));
  console.log('Response: ', res.processes.map((p) => `${p.pid}=${p.response}`).join('  '));
  console.log('Metrics:  ', JSON.stringify(res.metrics));
};

// Classic: at 0,1,2,3 | bt 4,3,7,2 | pr 2,1,4,3   (කුඩා අංකය = ඉහළ priority)
const P = (rows) => rows.map(([pid, at, bt, pr]) => ({ pid, at, bt, pr }));
const CLASSIC = P([
  ['P1', 0, 4, 2],
  ['P2', 1, 3, 1],
  ['P3', 2, 7, 4],
  ['P4', 3, 2, 3],
]);

show('Priority-P (preemptive) — P2 preempts P1', runCpu('priority-p', CLASSIC));
show('Priority-NP — P1 runs to completion (P2 must wait!)', runCpu('priority-np', CLASSIC));

// Equal priorities → FCFS ලෙස හැසිරෙනවාද?
const EQUAL = P([['P1', 0, 4, 5], ['P2', 1, 3, 5], ['P3', 2, 2, 5]]);
show('Priority-NP (හැමෝම එකම priority = 5) → FCFS වගේ', runCpu('priority-np', EQUAL));
show('Priority-P (හැමෝම එකම priority = 5) → FCFS වගේ', runCpu('priority-p', EQUAL));

// Idle gap + පොඩි case
show('Priority-P | idle + preemption (at 3,4 | bt 5,2 | pr 2,1)',
  runCpu('priority-p', P([['P1', 3, 5, 2], ['P2', 4, 2, 1]])));

show('Priority-NP | idle gap (at 4,5 | bt 3,2 | pr 1,2)',
  runCpu('priority-np', P([['P1', 4, 3, 1], ['P2', 5, 2, 2]])));

/* ── REGRESSION — පරණ ඔක්කොම තාම වැඩ කරනවද? ── */
const REG = [
  { pid: 'P1', at: 0, bt: 5 }, { pid: 'P2', at: 1, bt: 3 },
  { pid: 'P3', at: 2, bt: 8 }, { pid: 'P4', at: 3, bt: 6 },
];
show('regression FCFS (expect 5.75)', runCpu('fcfs', REG));
show('regression SJF  (expect 5.25)', runCpu('sjf', REG));
show('regression SRTF (expect 6.5)', runCpu('srtf', P([
  ['P1', 0, 8], ['P2', 1, 4], ['P3', 2, 9], ['P4', 3, 5],
])));
show('regression RR q=2 (expect 5.33)', runCpu('rr', P([
  ['P1', 0, 5], ['P2', 0, 4], ['P3', 0, 2],
]), { quantum: 2 }));