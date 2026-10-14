import { runCpu } from './algorithms/cpu.js';

const cases = [
  {
    name: 'SRTF classic (at 0,1,2,3 | bt 8,4,9,5)',
    type: 'srtf',
    processes: [
      { pid: 'P1', at: 0, bt: 8 },
      { pid: 'P2', at: 1, bt: 4 },
      { pid: 'P3', at: 2, bt: 9 },
      { pid: 'P4', at: 3, bt: 5 },
    ],
  },
  {
    name: 'SRTF small preemption (at 0,1 | bt 5,2)',
    type: 'srtf',
    processes: [
      { pid: 'P1', at: 0, bt: 5 },
      { pid: 'P2', at: 1, bt: 2 },
    ],
  },
  {
    name: 'SRTF with idle gap (at 4,5 | bt 3,2)',
    type: 'srtf',
    processes: [
      { pid: 'P1', at: 4, bt: 3 },
      { pid: 'P2', at: 5, bt: 2 },
    ],
  },
  {
    name: 'regression: FCFS still works',
    type: 'fcfs',
    processes: [
      { pid: 'P1', at: 0, bt: 5 },
      { pid: 'P2', at: 1, bt: 3 },
      { pid: 'P3', at: 2, bt: 8 },
      { pid: 'P4', at: 3, bt: 6 },
    ],
  },
  {
    name: 'regression: SJF still works',
    type: 'sjf',
    processes: [
      { pid: 'P1', at: 0, bt: 5 },
      { pid: 'P2', at: 1, bt: 3 },
      { pid: 'P3', at: 2, bt: 8 },
      { pid: 'P4', at: 3, bt: 6 },
    ],
  },
];

for (const c of cases) {
  const { gantt, processes, metrics } = runCpu(c.type, c.processes);
  console.log(`\n=== ${c.name} ===`);
  console.log('Gantt:    ', gantt.map((b) => `${b.idle ? 'Idle' : b.pid}:${b.start}-${b.end}`).join('  '));
  console.log('Waiting:  ', processes.map((p) => `${p.pid}=${p.waiting}`).join('  '));
  console.log('Response: ', processes.map((p) => `${p.pid}=${p.response}`).join('  '));
  console.log('Metrics:  ', JSON.stringify(metrics));
}