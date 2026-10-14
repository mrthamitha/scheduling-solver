/**
 * Disk head movement chart — 90° කරපු version (textbook style).
 *
 *   x = cylinder  (0 → maxCylinder, වමේ ඉඳන් දකුණට)
 *   y = service order (උඩ ඉඳන් පහළට — හැම පියවරක්ම එක පේළියක්)
 *
 * රතු dashed කැබැල්ල = jump එක (C-SCAN / C-LOOK වල return jump).
 * rowH එක වෙනස් කරලා උස පාලනය කරන්න පුළුවන් (පැතලි/උස).
 */
export default function HeadMovementChart({ steps, head, maxCylinder }) {
  if (!steps?.length) return null;

  const positions = [head, ...steps.map((s) => s.to)];
  const rows = positions.length;

  const W = 780;
  const padL = 34;   // වම් පැත්තේ step අංක වලට
  const padR = 30;
  const padT = 36;   // උඩ තියෙන cylinder axis එකට
  const padB = 28;
  const rowH = 30;   // ← පැතලි කරන්න මේක අඩු කරන්න / උස කරන්න වැඩි කරන්න
  const H = padT + (rows - 1) * rowH + padB;

  const x = (v) => padL + (v / maxCylinder) * (W - padL - padR);
  const y = (i) => padT + i * rowH;

  // cylinder axis ticks: 0 · ¼ · ½ · ¾ · max
  const step = maxCylinder / 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => (i === 4 ? maxCylinder : Math.round(i * step)));

  return (
    <svg
      className="headchart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Disk head movement"
      style={{ width: '100%' }}
    >
      {/* ── උඩ cylinder axis එක ── */}
      {ticks.map((v) => (
        <g key={`t${v}`}>
          <line x1={x(v)} x2={x(v)} y1={padT - 14} y2={padT - 8} stroke="#4a5a7d" />
          <text x={x(v)} y={padT - 20} fill="#93a1bd" fontSize="11" textAnchor="middle">{v}</text>
        </g>
      ))}
      <text x={W - padR} y={padT - 20} fill="#93a1bd" fontSize="11" textAnchor="end">cylinder</text>

      {/* ── හැම පේළියකටම ලා නිල් gridline එකක් ── */}
      {positions.map((v, i) => (
        <line
          key={`g${i}`}
          x1={padL} x2={W - padR} y1={y(i)} y2={y(i)}
          stroke={i === 0 ? '#33436b' : '#1c2740'}
          strokeWidth={i === 0 ? 1 : 0.7}
        />
      ))}

      {/* ── වම් පැත්තේ step අංක (head / 1 / 2 …) ── */}
      {positions.map((v, i) => (
        <text key={`s${i}`} x={padL - 8} y={y(i) + 4} fill="#93a1bd" fontSize="10" textAnchor="end">
          {i === 0 ? 'head' : i}
        </text>
      ))}

      {/* ── ගමන් කරන ඉරි (segments) ── */}
      {steps.map((s, i) => (
        <line
          key={`l${i}`}
          x1={x(positions[i])} y1={y(i)}
          x2={x(s.to)} y2={y(i + 1)}
          stroke={s.jump ? '#ff6b6b' : '#4c8dff'}
          strokeWidth={s.jump ? 2 : 2.5}
          strokeDasharray={s.jump ? '6 4' : undefined}
        />
      ))}

      {/* ── නවතින තැන් (points) + cylinder අංක ── */}
      {positions.map((v, i) => (
        <g key={`p${i}`}>
          <circle
            cx={x(v)} cy={y(i)} r={i === 0 ? 5 : 4}
            fill={i === 0 ? '#e6ecf7' : '#131c31'}
            stroke={i === 0 ? '#e6ecf7' : '#4c8dff'}
            strokeWidth="2"
          />
          {i > 0 && (
            <text x={x(v) + 8} y={y(i) + 4} fill="#93a1bd" fontSize="10">{v}</text>
          )}
        </g>
      ))}

      <text x={padL} y={H - 8} fill="#93a1bd" fontSize="11">
        head {head} · cylinders left to right · service order top to bottom
      </text>
    </svg>
  );
}