// algorithms/cpu.js — app එකේ "brain" එක
//
// HTTP / Express කිසිවක් මේ file එකේ නෑ — හිතාමතාම!
// Pure functions විතරයි: test කරන්න ලේසි, bug හොයන්න ලේසි.
//
// ව්‍යුහය:
//   makeWork()  → input එකේ copy එකක් හදනවා
//   fcfs()      → Gantt timeline එක (FCFS)
//   sjf()       → Gantt timeline එක (SJF, non-preemptive)
//   srtf()      → Gantt timeline එක (SRTF, preemptive)   🆕
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
    i,                 // original index — tie-break වලට ඕන
    finished: false,   // ඉවර වුනාද?
    remaining: p.bt,   // 🆕 ඉතිරි කාලය (SRTF වලට මේකයි මූලික)
    started: false,    // 🆕 පළවෙනි වතාවට CPU ගත්තාද? (response time එකට)
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
// ඊළඟ එක = ready queue එකේ කෙටිම burst එක තියෙන එක. ඉවර වෙනකම් කවුරුත් කපන්නේ නෑ.
function sjf(work) {
  const gantt = [];
  let t = 0;
  let done = 0;

  while (done < work.length) {
    const ready = work.filter((p) => !p.finished && p.at <= t);

    if (ready.length === 0) {
      const nextArrival = Math.min(...work.filter((p) => !p.finished).map((p) => p.at));
      gantt.push({ start: t, end: nextArrival, pid: null, idle: true });
      t = nextArrival;
      continue;
    }

    ready.sort((a, b) => a.bt - b.bt || a.at - b.at || a.i - b.i);
    const p = ready[0];

    p.start = t;
    t += p.bt;
    p.completion = t;
    p.finished = true;
    done += 1;
    gantt.push({ start: p.start, end: p.completion, pid: p.pid, idle: false });
  }

  return { gantt };
}

/* ── 4) SRTF (preemptive SJF) ─────────────────────────────── */
// SJF එකෙන් වෙනස: කෙනෙක් run වෙන ගමන් අලුත් කෙනෙක් ආවොත්, ඌට ඉතිරි කාලය අඩු නම්
// CPU එක කපලා ඌට දෙනවා. ඒ නිසා හැම පියවරකදීම: තෝරනවා → next event වෙනකම් run → ආයෙත් තෝරනවා
function srtf(work) {
  const gantt = [];
  let t = 0;
  let done = 0;

  // අසල්ලි කෑලි එකම process නම් ඈඳන helper (P1:0-1 සහ P1:10-17 වෙන වෙනම තියෙන්න ඕන,
  // ඒත් යාබදව ආවොත් එකට එකතු වෙන්න ඕන)
  const push = (pid, start, end, idle = false) => {
    const last = gantt[gantt.length - 1];
    if (last && last.pid === pid && last.end === start && last.idle === idle) last.end = end;
    else gantt.push({ start, end, pid, idle });
  };

  while (done < work.length) {
    // ① ඉතිරි කාලය අඩුම කවුද?
    const ready = work.filter((p) => !p.finished && p.at <= t);

    if (ready.length === 0) {
      const nextArrival = Math.min(...work.filter((p) => !p.finished).map((p) => p.at));
      push(null, t, nextArrival, true);
      t = nextArrival;
      continue;
    }

    ready.sort((a, b) => a.remaining - b.remaining || a.at - b.at || a.i - b.i);
    const p = ready[0];

    // ② පළවෙනි වතාවට CPU ගන්නකොට විතරයි `start` record කරන්නේ (response time)
    if (!p.started) {
      p.started = true;
      p.start = t;
    }

    // ③ ඊළඟ event එක = "මම ඉවර වෙනවා" හෝ "අලුත් කෙනෙක් එනවා" — කවුද කලින්ද?
    const future = work.filter((q) => !q.finished && q.at > t).map((q) => q.at);
    const nextArrival = future.length ? Math.min(...future) : Infinity;
    let run = Math.min(p.remaining, nextArrival - t);
    if (!Number.isFinite(run) || run <= 0) run = p.remaining;

    // ④ run කරලා Gantt එකට දානවා
    p.remaining -= run;
    push(p.pid, t, t + run, false);
    t += run;

    // ⑤ ඉවර වුනා නම්
    if (p.remaining === 0) {
      p.finished = true;
      done += 1;
      p.completion = t;
    }
  }

  return { gantt };
}

/* ── 5) Table + metrics (හැම algorithm එකකටම පොදු) ─────────── */
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

/* ── 6) පිවිසුම් දොර ─────────────────────────────────────── */
export function runCpu(type, processes) {
  const work = makeWork(processes);

  let out;
  if (type === 'fcfs') out = fcfs(work);
  else if (type === 'sjf') out = sjf(work);
  else if (type === 'srtf') out = srtf(work);   // 🆕
  else throw new Error(`"${type}" is not implemented yet`);

  return finalise(out.gantt, work);
}