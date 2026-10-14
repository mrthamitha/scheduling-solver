/**
 * Disk head movement chart එක — pure SVG (library එකක් නැතුව!).
 * x = හැම පියවරක්ම · y = cylinder අංකය · රතු කැබැල්ල = jump එක
 */
export default function HeadMovementChart({ steps, head, maxCylinder }) {
  if (!steps?.length) return null;

  const positions = [head, ...steps.map((s) => s.to)];
  const W = 660;
  const H = 280;
  const padX = 34;
  const padY = 26;

  const x = (i) => padX + (i / Math.max(1, positions.length - 1)) * (W - padX * 2);
  const y = (v) => H - padY - (v / maxCylinder) * (H - padY * 2);

  const gridValues = [0, Math.round(maxCylinder / 2), maxCylinder];

  return (
    <svg className="headchart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Disk head movement">
      {gridValues.map((v) => (
        <g key={v}>
          <line x1={padX} x2={W - padX} y1={y(v)} y2={y(v)} stroke="#26324d" strokeDasharray="3 5" />
          <text x={6} y={y(v) + 4} fill="#93a1bd" fontSize="11">{v}</text>
        </g>
      ))}

      {steps.map((s, i) => (
        <line
          key={`l${i}`}
          x1={x(i)}
          y1={y(positions[i])}
          x2={x(i + 1)}
          y2={y(s.to)}
          stroke={s.jump ? '#ff6b6b' : '#4c8dff'}
          strokeWidth={s.jump ? 2 : 2.5}
          strokeDasharray={s.jump ? '6 4' : undefined}
        />
      ))}

      {positions.map((v, i) => (
        <g key={`p${i}`}>
          <circle cx={x(i)} cy={y(v)} r={4} fill={i === 0 ? '#e6ecf7' : '#131c31'} stroke="#4c8dff" strokeWidth="2" />
          {i > 0 && (
            <text x={x(i)} y={y(v) - 9} fill="#93a1bd" fontSize="10" textAnchor="middle">{v}</text>
          )}
        </g>
      ))}

      <text x={padX} y={H - 6} fill="#93a1bd" fontSize="11">
        head {head} → first stop: {positions[1]} → ... → {positions[positions.length - 1]}
      </text>
    </svg>
  );
}