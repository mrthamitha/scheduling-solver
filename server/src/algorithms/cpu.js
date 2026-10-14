// algorithms/cpu.js — app එකේ "brain" එක

const round = (v) => Math.round(v * 100) / 100;

/* ── 1) Input copy ───────────────────────────────────────── */
function makeWork(processes) {
  return processes.map((p, i) => ({
    pid: p.pid ?? `P${i + 1}`,
    at: p.at,
    bt: p.bt,
    pr: p.pr ?? 0,
    i,
    finished: false,
    remaining: p.bt,
    started: false,
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

/* ── 3) SJF ──────────────────────────────────────────────── */
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

/* ── 4) SRTF ─────────────────────────────────────────────── */
function srtf(work) {
  const gantt = [];
  let t = 0;
  let done = 0;

  const push = (pid, start, end, idle = false) => {
    const last = gantt[gantt.length - 1];
    if (last && last.pid === pid && last.end === start && last.idle === idle) last.end = end;
    else gantt.push({ start, end, pid, idle });
  };

  while (done < work.length) {
    const ready = work.filter((p) => !p.finished && p.at <= t);

    if (ready.length === 0) {
      const nextArrival = Math.min(...work.filter((p) => !p.finished).map((p) => p.at));
      push(null, t, nextArrival, true);
      t = nextArrival;
      continue;
    }

    ready.sort((a, b) => a.remaining - b.remaining || a.at - b.at || a.i - b.i);
    const p = ready[0];

    if (!p.started) {
      p.started = true;
      p.start = t;
    }

    const future = work.filter((q) => !q.finished && q.at > t).map((q) => q.at);
    const nextArrival = future.length ? Math.min(...future) : Infinity;
    let run = Math.min(p.remaining, nextArrival - t);
    if (!Number.isFinite(run) || run <= 0) run = p.remaining;

    p.remaining -= run;
    push(p.pid, t, t + run, false);
    t += run;

    if (p.remaining === 0) {
      p.finished = true;
      done += 1;
      p.completion = t;
    }
  }
  return { gantt };
}

/* ── 5) Round Robin 🆕 ───────────────────────────────────── */
// හැම process එකකටත් උපරිම quantum එකක් විතරයි. ඉවර නොවුනොත් ආපහු පේළියේ අන්තිමට.
// ⚠️ එක quantum block එකක් = එක Gantt කෑල්ලක් (ඈඳන්නේ නෑ!) — RR එකේ ලස්සන
//    "□ □ □" pattern එක පේන්නේ ඒ නිසා.
function roundRobin(work, quantum) {
  const gantt = [];
  const queue = [];
  let t = 0;
  let done = 0;

  const sorted = [...work].sort((a, b) => a.at - b.at || a.i - b.i);
  let nextToArrive = 0;

  while (done < work.length) {
    // ① පේළිය හිස් නම් — ඊළඟ arrival එක එනකම් idle, ඊට පස්සේ පේළිය පුරවනවා
    if (queue.length === 0) {
      const upcoming = sorted[nextToArrive];
      if (!upcoming) break;                     // හැමෝම ඉවරයි
      if (upcoming.at > t) {
        gantt.push({ start: t, end: upcoming.at, pid: null, idle: true });
        t = upcoming.at;
      }
      while (nextToArrive < sorted.length && sorted[nextToArrive].at <= t) {
        queue.push(sorted[nextToArrive]);
        nextToArrive += 1;
      }
    }

    // ② පේළියේ පළවෙනි එක ගන්නවා
    const p = queue.shift();

    if (!p.started) {
      p.started = true;
      p.start = t;                              // response time — පළවෙනි වතාව විතරයි
    }

    // ③ quantum එක දක්වා run කරනවා
    const run = Math.min(quantum, p.remaining);
    const from = t;
    p.remaining -= run;
    t += run;
    gantt.push({ start: from, end: t, pid: p.pid, idle: false });

    // ④ ඒ කාලය ඇතුළත ආපු අලුත් අය පේළියට ⚠️ (මේක අමතක කරා නම් waiting වැරදි!)
    while (nextToArrive < sorted.length && sorted[nextToArrive].at <= t) {
      queue.push(sorted[nextToArrive]);
      nextToArrive += 1;
    }

    // ⑤ ඉවර නම් completion · නැත්නම් ආපහු පේළියේ අන්තිමට
    if (p.remaining === 0) {
      p.finished = true;
      done += 1;
      p.completion = t;
    } else {
      queue.push(p);
    }
  }

  return { gantt };
}

/* ── 6) Table + metrics (හැම algorithm එකකටම පොදු) ─────────── */
function finalise(gantt, work) {
  const result = work.map((p) => {
    const turnaround = p.completion - p.at;
    return {
      pid: p.pid, at: p.at, bt: p.bt, pr: p.pr,
      start: p.start, completion: p.completion,
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

/* ── 7) පිවිසුම් දොර ─────────────────────────────────────── */
// options: { quantum } — Round Robin එකට විතරයි ඕන
export function runCpu(type, processes, options = {}) {
  const work = makeWork(processes);
  const quantum = Number(options.quantum ?? 2);

  let out;
  if (type === 'fcfs') out = fcfs(work);
  else if (type === 'sjf') out = sjf(work);
  else if (type === 'srtf') out = srtf(work);
  else if (type === 'rr') out = roundRobin(work, quantum >= 1 ? quantum : 2);
  else throw new Error(`"${type}" is not implemented yet`);

  return finalise(out.gantt, work);
}