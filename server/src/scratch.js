import { runCpu } from './algorithms/cpu.js';

const cases = [
  {
    name: 'classic 4 processes',
    processes: [
      { pid: 'P1', at: 0, bt: 5 },
      { pid: 'P2', at: 1, bt: 3 },
      { pid: 'P3', at: 2, bt: 8 },
      { pid: 'P4', at: 3, bt: 6 },
    ],
  },
  {
    name: 'leading idle gap',
    processes: [{ pid: 'P1', at: 3, bt: 4 }],
  },
];

for (const c of cases) {
  const { gantt, processes, metrics } = runCpu('fcfs', c.processes);

  console.log(`\n=== ${c.name} ===`);
  console.log('Gantt:  ', gantt.map((b) => `${b.idle ? 'Idle' : b.pid}:${b.start}-${b.end}`).join('  '));
  console.log('Waiting:', processes.map((p) => `${p.pid}=${p.waiting}`).join('  '));
  console.log('Metrics:', JSON.stringify(metrics));
}