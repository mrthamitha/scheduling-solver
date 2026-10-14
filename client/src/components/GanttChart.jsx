import { formatNumber } from '../utils.js';

/**
 * CPU Gantt timeline එක.
 * හැම කෑල්ලකම පළල = ඒකේ කාලය (flexGrow එකෙන්) — ඒ නිසා 5 unit block එකක්
 * 2 unit block එකකට වඩා 2.5 ගුණයක් පළලයි. Chart එක scale වෙනවා!
 */
export default function GanttChart({ gantt, colorMap }) {
  if (!gantt?.length) return null;
  const end = gantt[gantt.length - 1].end;

  // Process එකකට කෑලි කීයක්ද? (SRTF/RR වල එකකට කෑලි කිහිපයක් තියෙන්න පුළුවන්)
  const rows = [];
  for (const b of gantt) {
    if (b.idle) continue;
    let row = rows.find((r) => r.pid === b.pid);
    if (!row) {
      row = { pid: b.pid, blocks: [] };
      rows.push(row);
    }
    row.blocks.push(b);
  }

  return (
    <div className="gantt-area">
      <div className="gantt">
        {gantt.map((b, i) => (
          <div
            key={i}
            className={b.idle ? 'gblock idle' : 'gblock'}
            style={{
              flexGrow: b.end - b.start,
              background: b.idle ? undefined : colorMap[b.pid],
            }}
            title={`${b.idle ? 'Idle' : b.pid}: ${b.start} - ${b.end} (${b.end - b.start})`}
          >
            <span className="glabel">{b.idle ? 'idle' : b.pid}</span>
            <span className="gdur">{formatNumber(b.end - b.start)}</span>
          </div>
        ))}
      </div>

      <div className="gantt-rows">
        {rows.map((row) => (
          <div key={row.pid} className="grow">
            <span className="grow-pid" style={{ color: colorMap[row.pid] }}>{row.pid}</span>
            <div className="grow-track">
              {row.blocks.map((b, i) => (
                <div
                  key={i}
                  className="grow-block"
                  style={{
                    left: `${(b.start / end) * 100}%`,
                    width: `${((b.end - b.start) / end) * 100}%`,
                    background: colorMap[row.pid],
                  }}
                  title={`${b.start} - ${b.end}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}