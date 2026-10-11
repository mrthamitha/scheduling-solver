// algorithms/cpu.js — app එකේ "brain" එක

export function runCpu(type, processes) {
  if (type !== 'fcfs') throw new Error(`"${type}" is not implemented yet`);

  // 1) input එකේ COPY එකක් හදන්න (original array එක mutate කරන්න එපා!)
  //    pid නැත්නම් `P${i+1}` ලෙස දෙන්න. original index එක (i) තියාගන්න.
  const work = processes.map((p, i) => ({
    pid: p.pid ?? `P${i + 1}`,
    at: p.at,
    bt: p.bt,
    i,
  }));

  const gantt = [];
  let t = 0;

  // 2) FCFS — arrival order එකෙන් යනවා
  const order = [...work].sort((a, b) => a.at - b.at || a.i - b.i);

  for (const p of order) {
  // (a) — CPU එක නිකන් තිබුණ කාලයක් තියෙනවා නම් ඒක record කරන්න
  if (t < p.at) {                                                    // ①
    gantt.push({ start: t, end: p.at, pid: null, idle: true });       // ② ③
    t = p.at;                                                        // ④
  }

  // (b) — process එකට වේලාව දෙන්න
  p.start = t;              // ⑤
  t += p.bt;                // ⑥
  p.completion = t;         // ⑦

  // (c) — CPU block එක chart එකට දාන්න
  gantt.push({ start: p.start, end: p.completion, pid: p.pid, idle: false });  // ⑧ ⑨ ⑩ ⑪
}

  return { gantt };
}