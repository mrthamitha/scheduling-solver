// algorithms/cpu.js — app එකේ "brain" එක
//
// මේ file එකේ HTTP / Express කිසිවක් නෑ — හිතාමතාම!
// Pure functions විතරයි: test කරන්න ලේසි, bug හොයන්න ලේසි.

/** අගයන් දශම 2කට වට කරනවා (0.1 + 0.2 = 0.30000000000000004 කියන ප්‍රශ්නය නිසා) */
const round = (v) => Math.round(v * 100) / 100;

export function runCpu(type, processes) {
  if (type !== 'fcfs') throw new Error(`"${type}" is not implemented yet`);

  /* 1) input එකේ COPY එකක් හදනවා
        - original array එක mutate කරන්නේ නෑ (හැමවෙලේම එකම උත්තරය එන්න ඕන නිසා)
        - `i` = original index (tie-breaking වලට පස්සේ ඕන වෙනවා)
        - `pr` = priority (තවම පාවිච්චි නොකළත්, දැන්ම තියාගමු) */
  const work = processes.map((p, i) => ({
    pid: p.pid ?? `P${i + 1}`,
    at: p.at,
    bt: p.bt,
    pr: p.pr ?? 0,
    i,
  }));

  /* 2) FCFS — arrival order එකෙන්, run to completion */
  const gantt = [];
  let t = 0;

  const order = [...work].sort((a, b) => a.at - b.at || a.i - b.i);

  for (const p of order) {
    // (a) CPU එක නිකන් තිබුණ කාලයක් නම් ඒක record කරනවා
    if (t < p.at) {
      gantt.push({ start: t, end: p.at, pid: null, idle: true });
      t = p.at;
    }

    // (b) process එකට වේලාව දෙනවා
    p.start = t;
    t += p.bt;
    p.completion = t;

    // (c) CPU block එක chart එකට දානවා
    gantt.push({ start: p.start, end: p.completion, pid: p.pid, idle: false });
  }

  /* 3) Metrics — textbook formulas:
        turnaround = completion − arrival
        waiting    = turnaround − burst
        response   = first time on CPU − arrival                */
  const result = work.map((p) => {
    const turnaround = p.completion - p.at;
    const waiting = turnaround - p.bt;
    const response = p.start - p.at;
    return {
      pid: p.pid,
      at: p.at,
      bt: p.bt,
      pr: p.pr,
      start: p.start,
      completion: p.completion,
      turnaround,
      waiting,
      response,
    };
  });

  const n = result.length;
  const averageOf = (key) =>
    n ? round(result.reduce((sum, p) => sum + p[key], 0) / n) : 0;

  const makespan = gantt.length ? gantt[gantt.length - 1].end : 0;
  const busy = gantt
    .filter((b) => !b.idle)
    .reduce((sum, b) => sum + (b.end - b.start), 0);

  // අසල්ලි CPU blocks දෙකක් වෙනස් process නම් = context switch එකක්
  // (idle → process එකක් කියන එක context switch එකක් නෙවෙයි)
  let contextSwitches = 0;
  for (let i = 1; i < gantt.length; i++) {
    if (!gantt[i].idle && !gantt[i - 1].idle && gantt[i].pid !== gantt[i - 1].pid) {
      contextSwitches += 1;
    }
  }

  const metrics = {
    avgWaiting: averageOf('waiting'),
    avgTurnaround: averageOf('turnaround'),
    avgResponse: averageOf('response'),
    contextSwitches,
    utilisation: makespan ? round((busy / makespan) * 100) : 0,
    idleTime: makespan - busy,
    makespan,
  };

  return { gantt, processes: result, metrics };
}