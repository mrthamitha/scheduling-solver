import { runCpu } from './algorithms/cpu.js';

const processes = [
  { pid: 'P1', at: 0, bt: 5 },
  { pid: 'P2', at: 1, bt: 3 },
  { pid: 'P3', at: 2, bt: 8 },
  { pid: 'P4', at: 3, bt: 6 },
];

const { gantt } = runCpu('fcfs', processes);

console.log('Gantt:', gantt.map((b) => `${b.idle ? 'Idle' : b.pid}:${b.start}-${b.end}`).join('  '));

// 🧪 Check: original array එක වෙනස් වුනාද?
console.log('original input:', JSON.stringify(processes));