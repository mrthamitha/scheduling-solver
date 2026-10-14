// algorithms/disk.js — disk scheduling (head movement) එකේ "brain" එක
//
// 🎓 මූලික අදහස: හැම algorithm එකකුත් කරන්නේ එකම දෙයක් —
//    "head එක යන cylinder අංක පිළිවෙලට" එකක් (visit list) හදනවා.
//    ඊට පස්සේ ඒ list එකෙන් seek distance ටික ගණනය වෙනවා (හැම algorithm එකකටම පොදු!).
//
// OUTPUT: { algorithm, head, direction, maxCylinder, order, steps, total, average }

const round = (value) => Math.round(value * 100) / 100;

export const DISK_ALGOS = [
  { id: 'fcfs', name: 'FCFS — First Come First Serve', needsDirection: false },
  { id: 'sstf', name: 'SSTF — Shortest Seek Time First', needsDirection: false },
  { id: 'scan', name: 'SCAN — Elevator algorithm', needsDirection: true },
  { id: 'cscan', name: 'C-SCAN — Circular SCAN', needsDirection: true },
  { id: 'look', name: 'LOOK', needsDirection: true },
  { id: 'clook', name: 'C-LOOK — Circular LOOK', needsDirection: true },
];

/* ── 1) Visit list builder ─────────────────────────────────────────────
 * Entries: { value, jump? }
 * jump = true කියන්නේ "return jump" එකක් — එතන නවතින්නේ නෑ, head එක
 * කෙළින්ම අනිත් පැත්තට යනවා (C-SCAN / C-LOOK වලට විතරයි).
 */
function buildVisits(type, requests, head, direction, maxCylinder) {
  const entries = [];
  const add = (value, jump = false) => {
    const last = entries[entries.length - 1];
    if (last && last.value === value) {
      if (jump) last.jump = true;   // එකම තැනට දෙපාරක් ආවොත් jump එක mark කරන්න
      return;
    }
    entries.push({ value, jump });
  };

  // හැම algorithm එකකටම වැදගත් කණ්ඩායම් 4ක්:
  const lower = requests.filter((r) => r <= head).sort((a, b) => a - b);       // head එකට යටින්
  const lowerDesc = [...lower].reverse();                                      // ලොකු එකේ ඉඳන් පහළට
  const higher = requests.filter((r) => r > head).sort((a, b) => a - b);       // head එකට උඩින්
  const higherDesc = [...higher].reverse();                                    // ලොකු එකේ ඉඳන් පහළට

  switch (type) {
    // ① FCFS — ආපු පිළිවෙලටම
    case 'fcfs':
      requests.forEach((r) => add(r));
      break;

    // ② SSTF — හැම පියවරකදීම "දැන් තියෙන තැනට ළඟම එකා"
    //    ⚠️ අනතුර: දුර තියෙන එකා කවදාවත් නොගියොත් (starvation)
    case 'sstf': {
      let current = head;
      const pending = [...requests];
      while (pending.length) {
        pending.sort((a, b) => Math.abs(a - current) - Math.abs(b - current) || a - b);
        current = pending.shift();
        add(current);
      }
      break;
    }

    // ③ SCAN (elevator) — එක පැත්තකට ගිහින්, අන්තිමට (0 හෝ 199) ගිහින්, ආපහු හැරෙනවා
    case 'scan':
      if (direction === 'right') {
        higher.forEach((v) => add(v));
        add(maxCylinder);                    // disk එකේ අන්තිමට (199)
        lowerDesc.forEach((v) => add(v));
      } else {
        lowerDesc.forEach((v) => add(v));
        add(0);                              // disk එකේ මුලට
        higher.forEach((v) => add(v));
      }
      break;

    // ④ C-SCAN — එක පැත්තකට විතරයි සේවා කරන්නේ, ඉතිරිය අන්තිමට 0 ට පනිනවා
    case 'cscan':
      if (direction === 'right') {
        higher.forEach((v) => add(v));
        add(maxCylinder);
        add(0, true);                        // 🚀 jump!
        lower.forEach((v) => add(v));
      } else {
        lowerDesc.forEach((v) => add(v));
        add(0);
        add(maxCylinder, true);              // 🚀 jump!
        higherDesc.forEach((v) => add(v));
      }
      break;

    // ⑤ LOOK — SCAN වගේ, ඒත් අන්තිමට *අන්තිම request* එකට විතරයි යන්නේ
    case 'look':
      if (direction === 'right') {
        higher.forEach((v) => add(v));
        lowerDesc.forEach((v) => add(v));
      } else {
        lowerDesc.forEach((v) => add(v));
        higher.forEach((v) => add(v));
      }
      break;

    // ⑥ C-LOOK — අන්තිම request එකේ ඉඳන් පළවෙනි request එකට පනිනවා
    case 'clook':
      if (direction === 'right') {
        higher.forEach((v) => add(v));
        if (lower.length) lower.forEach((v, i) => add(v, i === 0));       // පළවෙනි එකට 🚀
        else if (higher.length) add(higher[0], true);
      } else {
        lowerDesc.forEach((v) => add(v));
        if (higher.length) higherDesc.forEach((v, i) => add(v, i === 0)); // පළවෙනි එකට 🚀
        else if (lower.length) add(lowerDesc[0], true);
      }
      break;

    default:
      throw new Error(`"${type}" is not implemented yet`);
  }

  return entries;
}

/* ── 2) පිවිසුම් දොර ─────────────────────────────────────────────────── */
// requests = [98, 183, 37, ...] · head = දැන් ඉන්න cylinder එක
// options  = { direction: 'left' | 'right', maxCylinder: 199 }
export function runDisk(type, requests, head, options = {}) {
  const direction = options.direction === 'left' ? 'left' : 'right';
  const maxCylinder = options.maxCylinder ?? 199;

  const entries = buildVisits(type, requests, head, direction, maxCylinder);

  // 🎓 මේ පියවර හැම algorithm එකකටම පොදුයි — visit list එකේ ඉඳන් දුර ගණනය විතරයි
  const steps = [];
  let current = head;
  let cumulative = 0;

  for (const entry of entries) {
    const distance = Math.abs(entry.value - current);
    cumulative += distance;
    steps.push({
      from: current,
      to: entry.value,
      distance,
      cumulative,
      jump: Boolean(entry.jump),
    });
    current = entry.value;
  }

  return {
    algorithm: type,          // ⚠️ `type` කියලා නම දැම්මොත් route එකේ `type:'disk'` overwrite වෙනවා!
    head,
    direction,
    maxCylinder,
    order: entries.map((e) => e.value),
    steps,
    total: cumulative,
    average: requests.length ? round(cumulative / requests.length) : 0,
  };
}