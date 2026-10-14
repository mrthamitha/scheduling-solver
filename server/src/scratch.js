import { runCpu } from './algorithms/cpu.js';

const cases = [
  {
    name: 'classic 4 processes (at 0,1,2,3 / bt 5,3,8,6)',
    processes: [
      { pid: 'P1', at: 0, bt: 5 },
      { pid: 'P2', at: 1, bt: 3 },
      { pid: 'P3', at: 2, bt: 8 },
      { pid: 'P4', at: 3, bt: 6 },
    ],
  },
  {
    name: 'all arrive together (bt 6,8,7,3)',
    processes: [
      { pid: 'P1', at: 0, bt: 6 },
      { pid: 'P2', at: 0, bt: 8 },
      { pid: 'P3', at: 0, bt: 7 },
      { pid: 'P4', at: 0, bt: 3 },
    ],
  },
  {
    name: 'leading idle gap',
    processes: [{ pid: 'P1', at: 3, bt: 4 }],
  },
];

for (const c of cases) {
  console.log(`\n=== ${c.name} ===`);
  for (const type of ['fcfs', 'sjf']) {
    const { gantt, processes, metrics } = runCpu(type, c.processes);
    console.log(`  ${type.toUpperCase()}`);
    console.log('    Gantt:     ', gantt.map((b) => `${b.idle ? 'Idle' : b.pid}:${b.start}-${b.end}`).join('  '));
    console.log('    Waiting:   ', processes.map((p) => `${p.pid}=${p.waiting}`).join('  '));
    console.log('    avgWaiting:', metrics.avgWaiting, '| avgTurnaround:', metrics.avgTurnaround);
  }
}