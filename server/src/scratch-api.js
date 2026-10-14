// scratch-api.js — API එක test කරන්න (server එක වෙනම terminal එකක run වෙන්න ඕන)
const BASE = process.env.API_URL ?? 'http://localhost:4000';

const post = async (body) => {
  const res = await fetch(`${BASE}/api/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
};

// ① health
const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
console.log('① /api/health      →', JSON.stringify(health));

// ② algorithms list
const algos = await fetch(`${BASE}/api/algorithms`).then((r) => r.json());
console.log('② /api/algorithms  → CPU:', algos.cpu.length, '· Disk:', algos.disk.length);
console.log('   CPU ids:', algos.cpu.map((a) => a.id).join(', '));

// ③ CPU — SJF
const cpu = await post({
  type: 'cpu', algorithm: 'sjf',
  processes: [
    { pid: 'P1', at: 0, bt: 5 }, { pid: 'P2', at: 1, bt: 3 },
    { pid: 'P3', at: 2, bt: 8 }, { pid: 'P4', at: 3, bt: 6 },
  ],
});
console.log('\n③ CPU SJF → HTTP', cpu.status);
console.log('   type:', cpu.data.type, '| algorithm:', cpu.data.algorithm);
console.log('   Gantt:', cpu.data.gantt.map((b) => `${b.idle ? 'Idle' : b.pid}:${b.start}-${b.end}`).join(' '));
console.log('   avgWaiting:', cpu.data.metrics.avgWaiting);
console.log('   comparison (server-computed):');
for (const c of cpu.data.comparison) {
  console.log(`     ${c.name.padEnd(12)} ${c.applicable ? `avgWT ${String(c.avgWaiting).padStart(6)}` : c.reason}`);
}

// ④ CPU — Round Robin with quantum
const rr = await post({
  type: 'cpu', algorithm: 'rr', quantum: 2,
  processes: [{ at: 0, bt: 5 }, { at: 0, bt: 4 }, { at: 0, bt: 2 }],
});
console.log('\n④ CPU RR q=2 →', rr.data.gantt.map((b) => `${b.pid}:${b.start}-${b.end}`).join(' '), '| avgWT', rr.data.metrics.avgWaiting);

// ⑤ Disk — SSTF
const disk = await post({ type: 'disk', algorithm: 'sstf', requests: [98, 183, 37, 122, 14, 124, 65, 67], head: 53 });
console.log('\n⑤ Disk SSTF → HTTP', disk.status, '| type:', disk.data.type);
console.log('   Order:', [disk.data.head, ...disk.data.order].join(' → '));
console.log('   Total:', disk.data.total, '| Average:', disk.data.average);
console.log('   comparison:');
for (const c of disk.data.comparison) console.log(`     ${c.name.padEnd(8)} total ${String(c.total).padStart(4)}`);

// ⑥ Validation — වැරදි input එකක්
const bad = await post({ type: 'cpu', algorithm: 'sjf', processes: [] });
console.log('\n⑥ Bad input (empty processes) → HTTP', bad.status);
console.log('   error:', bad.data.error);

const bad2 = await post({ type: 'cpu', algorithm: 'priority-p', processes: [{ at: 0, bt: 5 }] });
console.log('   no priorities    → HTTP', bad2.status, '| error:', bad2.data.error);

const bad3 = await fetch(`${BASE}/api/nope`).then(async (r) => ({ status: r.status, data: await r.json() }));
console.log('   unknown route    → HTTP', bad3.status, '| error:', bad3.data.error);