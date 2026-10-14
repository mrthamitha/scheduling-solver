import { runCpu } from './algorithms/cpu.js';

const show = (name, res) => {
  console.log(`\n=== ${name} ===`);
  console.log('Gantt:    ', res.gantt.map((b) => `${b.idle ? 'Idle' : b.pid}:${b.start}-${b.end}`).join('  '));
  console.log('Waiting:  ', res.processes.map((p) => `${p.pid}=${p.waiting}`).join('  '));
  console.log('Response: ', res.processes.map((p) => `${p.pid}=${p.response}`).join('  '));
  console.log('Metrics:  ', JSON.stringify(res.metrics));
};

show('RR classic q=2 (at 0,0,0 | bt 5,4,2)',
  runCpu('rr', [
    { pid: 'P1', at: 0, bt: 5 },
    { pid: 'P2', at: 0, bt: 4 },
    { pid: 'P3', at: 0, bt: 2 },
  ], { quantum: 2 }));

show('RR staggered q=2 (at 0,1,2 | bt 5,3,4)',
  runCpu('rr', [
    { pid: 'P1', at: 0, bt: 5 },
    { pid: 'P2', at: 1, bt: 3 },
    { pid: 'P3', at: 2, bt: 4 },
  ], { quantum: 2 }));

show('RR single process q=2 (at 0 | bt 5)',
  runCpu('rr', [{ pid: 'P1', at: 0, bt: 5 }], { quantum: 2 }));

show('RR q=10 (big quantum → like FCFS)',
  runCpu('rr', [
    { pid: 'P1', at: 0, bt: 5 },
    { pid: 'P2', at: 1, bt: 3 },
    { pid: 'P3', at: 2, bt: 8 },
    { pid: 'P4', at: 3, bt: 6 },
  ], { quantum: 10 }));

show('RR idle gap q=2 (at 4,5 | bt 3,2)',
  runCpu('rr', [
    { pid: 'P1', at: 4, bt: 3 },
    { pid: 'P2', at: 5, bt: 2 },
  ], { quantum: 2 }));

// regression — පරණ algorithms තාම වැඩ කරනවද?
show('regression FCFS', runCpu('fcfs', [
  { pid: 'P1', at: 0, bt: 5 }, { pid: 'P2', at: 1, bt: 3 },
  { pid: 'P3', at: 2, bt: 8 }, { pid: 'P4', at: 3, bt: 6 },
]));
show('regression SRTF', runCpu('srtf', [
  { pid: 'P1', at: 0, bt: 8 }, { pid: 'P2', at: 1, bt: 4 },
  { pid: 'P3', at: 2, bt: 9 }, { pid: 'P4', at: 3, bt: 5 },
]));