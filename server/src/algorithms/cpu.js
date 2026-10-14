// algorithms/cpu.js — app එකේ "brain" එක
//
// HTTP / Express කිසිවක් මේ file එකේ නෑ — හිතාමතාම!
// Pure functions විතරයි: test කරන්න ලේසි, bug හොයන්න ලේසි.
//
// ව්‍යුහය (මේ පිළිවෙල මතක තියාගන්න):
//   makeWork()  → input එකේ copy එකක් හදනවා
//   fcfs()      → Gantt timeline එක (FCFS)      ← "algorithm එකේ වෙනස" මෙතන
//   sjf()       → Gantt timeline එක (SJF)       ← "algorithm එකේ වෙනස" මෙතන
//   finalise()  → table + metrics (හැම algorithm එකකටම පොදු!)
//   runCpu()    → පිවිසුම් දොර — type එක බලලා හරි එක තෝරනවා

const round = (v) => Math.round(v * 100) / 100;

/* ── 1) Input copy ───────────────────────────────────────── */
function makeWork(processes) {
  return processes.map((p, i) => ({
    pid: p.pid ?? `P${i + 1}`,
    at: p.at,
    bt: p.bt,
    pr: p.pr ?? 0,
    i,                // original index — tie-break වලට ඕන
    finished: false,  // SJF වගේ algorithms වලට ඕන
  }));
}

/* ── 2) FCFS ─────────────────────────────────────────────── */
function fcfs(work) {
  const gantt = [];
  let t = 0;

  const order = [...work].sort((a, b) => a.at - b.at || a.i - b.i);

  for (const p of order) {
    if (t < p.at) {
      gantt.push({ start: t, end: p.at, pid: null, idle: true });
      t = p.at;
    }
    p.start = t;
    t += p.bt;
    p.completion = t;
    p.finished = true;
    gantt.push({ start: p.start, end: p.completion, pid: p.pid, idle: false });
  }

  return { gantt };
}

/* ── 3) SJF (non-preemptive) ─────────────────────────────── */
// FCFS එකෙන් වෙනස: ඊළඟ එක තෝරන්නේ "ආපු පිළිවෙලට" නෙවෙයි —
// "ready queue එකේ ඉන්න කෙටිම burst එක තියෙන එකව".
// ඒ නිසා හැම වතාවකම අලුතින් තෝරන්න ඕන — කලින්ම sort කරන්න බෑ!
function sjf(work) {
  const gantt = [];
  let t = 0;
  let done = 0;

  while (done < work.length) {
    // ① Ready queue: ඇවිත් තියෙන (at <= t) + තවම ඉවර නැති (!finished) ඒවා
    const ready = work.filter((p) => !p.finished && p.at <= t);

    // ② කවුරුත් නැත්නම් CPU එක idle — ඊළඟ arrival එකට යනවා
    if (ready.length === 0) {
      const nextArrival = Math.min(...work.filter((p) => !p.finished).map((p) => p.at));
      gantt.push({ start: t, end: nextArrival, pid: null, idle: true });
      t = nextArrival;
      continue; // ← loop එකේ මුලට ආයෙත් යනවා
    }

    // ③ කෙටිම burst එක තෝරනවා
    //    (tie නම්: කලින් ආපු එක → ඊටත් tie නම් කලින් හදපු එක)
    ready.sort((a, b) => a.bt - b.bt || a.at - b.at || a.i - b.i);
    const p = ready[0];

    // ④ ඉවර වෙනකම් run කරනවා (non-preemptive!)
    p.start = t;
    t += p.bt;
    p.completion = t;
    p.finished = true;
    done += 1;
    gantt.push({ start: p.start, end: p.completion, pid: p.pid, idle: false });
  }

  return { gantt };
}

/* ── 4) Table + metrics (හැම algorithm එකකටම පොදු) ─────────── */
function finalise(gantt, work) {
  const result = work.map((p) => {
    const turnaround = p.completion - p.at;
    return {
      pid: p.pid,
      at: p.at,
      bt: p.bt,
      pr: p.pr,
      start: p.start,
      completion: p.completion,
      turnaround,
      waiting: turnaround - p.bt,
      response: p.start - p.at,
    };
  });

  const n = result.length;
  const averageOf = (key) => (n ? round(result.reduce((s, p) => s + p[key], 0) / n) : 0);

  const makespan = gantt.length ? gantt[gantt.length - 1].end : 0;
  const busy = gantt.filter((b) => !b.idle).reduce((s, b) => s + (b.end - b.start), 0);

  // අසල්ලි CPU blocks දෙකක් වෙනස් process නම් = context switch එකක්
  let contextSwitches = 0;
  for (let i = 1; i < gantt.length; i++) {
    if (!gantt[i].idle && !gantt[i - 1].idle && gantt[i].pid !== gantt[i - 1].pid) {
      contextSwitches += 1;
    }
  }

  return {
    gantt,
    processes: result,
    metrics: {
      avgWaiting: averageOf('waiting'),
      avgTurnaround: averageOf('turnaround'),
      avgResponse: averageOf('response'),
      contextSwitches,
      utilisation: makespan ? round((busy / makespan) * 100) : 0,
      idleTime: makespan - busy,
      makespan,
    },
  };
}

/* ── 5) පිවිසුම් දොර ─────────────────────────────────────── */
export function runCpu(type, processes) {
  const work = makeWork(processes);

  let out;
  if (type === 'fcfs') out = fcfs(work);
  else if (type === 'sjf') out = sjf(work);
  else throw new Error(`"${type}" is not implemented yet`);

  return finalise(out.gantt, work);
}