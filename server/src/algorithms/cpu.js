// algorithms/cpu.js — app එකේ "brain" එක
//
// 🎓 ලොකු පාඩම: FCFS හැරුණු කොට අනිත් හැම algorithm එකක්ම engine දෙකෙන් එකක්.
//    වෙනස තියෙන්නේ "කවුද දිනන්නේ?" කියන score function එකේ විතරයි:
//
//      nonPreemptiveEngine:  SJF (score = -bt) · Priority-NP (score = -pr) · (HRRN — ඊළඟට)
//      preemptiveEngine:     SRTF (score = -remaining) · Priority-P (score = -pr)
//
//    score වැඩි එකා දිනනවා. ඒ නිසා "කුඩා අගය හොඳ" නම් minus (-) එකක් දාන්න ඕන.

const round = (v) => Math.round(v * 100) / 100;
/* ── 0) Algorithm list (frontend dropdown එකට + validation වලට) ── */
export const CPU_ALGOS = [
  {
    id: 'fcfs', name: 'First Come First Serve (FCFS)', short: 'FCFS',
    needsPriority: false, needsQuantum: false,
    description: 'Processes are served in arrival order, each running to completion. Simple and fair, but one long job can hold up everybody behind it.',
  },
  {
    id: 'sjf', name: 'Shortest Job First — non-preemptive (SJF)', short: 'SJF',
    needsPriority: false, needsQuantum: false,
    description: 'The available process with the smallest burst time runs to completion. Gives the lowest average waiting time, but long jobs can starve.',
  },
  {
    id: 'srtf', name: 'Shortest Remaining Time First — preemptive (SRTF)', short: 'SRTF',
    needsPriority: false, needsQuantum: false,
    description: 'Preemptive SJF: a newly arrived process takes the CPU whenever its remaining time is smaller than the running process.',
  },
  {
    id: 'rr', name: 'Round Robin (RR)', short: 'RR',
    needsPriority: false, needsQuantum: true,
    description: 'Every process takes turns in a circular queue and may run for at most one time quantum. The standard choice for time-sharing systems.',
  },
  {
    id: 'priority-p', name: 'Priority — preemptive', short: 'Priority-P',
    needsPriority: true, needsQuantum: false,
    description: 'The highest-priority process (smallest number) runs and preempts a running lower-priority process as soon as it arrives.',
  },
  {
    id: 'priority-np', name: 'Priority — non-preemptive', short: 'Priority-NP',
    needsPriority: true, needsQuantum: false,
    description: 'The highest-priority process that is present runs to completion. A newly arrived process must wait, even if it has a higher priority.',
  },
  {
    id: 'hrrn', name: 'Highest Response Ratio Next (HRRN)', short: 'HRRN',
    needsPriority: false, needsQuantum: false,
    description: 'Non-preemptive: the process with the highest response ratio (waiting + burst) / burst wins. Long waiters slowly gain priority, so nobody starves.',
  },
];
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

/* ── 3) Non-preemptive engine 🆕 (SJF + Priority-NP හවුලේ) ── */
// හැම පියවරකදීම: ready queue එකේ ඉහළම score එක තියෙන එකා තෝරලා, ඉවර වෙනකම් run කරනවා.
function nonPreemptive(work, score) {
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

    // score වැඩි එකා මුලට. Tie නම්: කලින් ආපු එක → ඊටත් tie නම් පළවෙනි එක.
    ready.sort((a, b) => score(b, t) - score(a, t) || a.at - b.at || a.i - b.i);
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

/* ── 4) Preemptive engine 🆕 (SRTF + Priority-P හවුලේ) ────── */
// හැම event එකකදීම (arrival එකක් හෝ ඉවරවීමක්) ආයෙත් තෝරනවා → preemption automatic.
function preemptive(work, score) {
  const gantt = [];
  let t = 0;
  let done = 0;

  const push = (pid, start, end, idle = false) => {
    const last = gantt[gantt.length - 1];
    if (last && last.pid === pid && last.end === start && last.idle === idle) last.end = end;
    else gantt.push({ start, end, pid, idle });
  };

  while (done < work.length) {
    const unfinished = work.filter((p) => !p.finished);
    const ready = unfinished.filter((p) => p.at <= t);

    if (ready.length === 0) {
      const nextArrival = Math.min(...unfinished.map((p) => p.at));
      push(null, t, nextArrival, true);
      t = nextArrival;
      continue;
    }

    ready.sort((a, b) => score(b, t) - score(a, t) || a.at - b.at || a.i - b.i);
    const p = ready[0];

    if (!p.started) {
      p.started = true;
      p.start = t;              // response time — පළවෙනි වතාව විතරයි
    }

    // ඊළඟ event එක එනකම් විතරයි run කරන්න පුළුවන්
    const future = unfinished.filter((q) => q.at > t).map((q) => q.at);
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

/* ── 5) Round Robin ──────────────────────────────────────── */
function roundRobin(work, quantum) {
  const gantt = [];
  const queue = [];
  let t = 0;
  let done = 0;

  const sorted = [...work].sort((a, b) => a.at - b.at || a.i - b.i);
  let nextToArrive = 0;

  while (done < work.length) {
    if (queue.length === 0) {
      const upcoming = sorted[nextToArrive];
      if (!upcoming) break;
      if (upcoming.at > t) {
        gantt.push({ start: t, end: upcoming.at, pid: null, idle: true });
        t = upcoming.at;
      }
      while (nextToArrive < sorted.length && sorted[nextToArrive].at <= t) {
        queue.push(sorted[nextToArrive]);
        nextToArrive += 1;
      }
    }

    const p = queue.shift();

    if (!p.started) {
      p.started = true;
      p.start = t;
    }

    const run = Math.min(quantum, p.remaining);
    const from = t;
    p.remaining -= run;
    t += run;
    gantt.push({ start: from, end: t, pid: p.pid, idle: false });

    while (nextToArrive < sorted.length && sorted[nextToArrive].at <= t) {
      queue.push(sorted[nextToArrive]);
      nextToArrive += 1;
    }

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
export function runCpu(type, processes, options = {}) {
  const work = makeWork(processes);
  const quantum = Number(options.quantum ?? 2);

  let out;
  if (type === 'fcfs') out = fcfs(work);
  else if (type === 'sjf') out = nonPreemptive(work, (p) => -p.bt);
  else if (type === 'priority-np') out = nonPreemptive(work, (p) => -p.pr);
  else if (type === 'srtf') out = preemptive(work, (p) => -p.remaining);
  else if (type === 'priority-p') out = preemptive(work, (p) => -p.pr);
  else if (type === 'priority-p') out = preemptive(work, (p) => -p.pr);
  // 🆕 HRRN — score එකට minus ඕන නෑ! ලොකු ratio එකම හොඳ.
  // කල් ඉන්න එකාගේ ratio එක ටික ටික උස්සන නිසා starve වෙන්නේ නෑ (aging auto).
  else if (type === 'hrrn') out = nonPreemptive(work, (p, t) => (t - p.at + p.bt) / p.bt);
  else if (type === 'rr') out = roundRobin(work, quantum >= 1 ? quantum : 2);
  else if (type === 'rr') out = roundRobin(work, quantum >= 1 ? quantum : 2);
  else throw new Error(`"${type}" is not implemented yet`);

  return finalise(out.gantt, work);
}