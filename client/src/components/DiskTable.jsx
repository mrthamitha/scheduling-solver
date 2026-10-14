import { formatNumber } from '../utils.js';

export default function DiskTable({ steps }) {
  if (!steps?.length) return null;
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>#</th>
          <th>From</th>
          <th>To</th>
          <th>Distance</th>
          <th>Cumulative</th>
        </tr>
      </thead>
      <tbody>
        {steps.map((s, i) => (
          <tr key={i} className={s.jump ? 'jump-row' : undefined}>
            <td>{i + 1}</td>
            <td>{s.from}</td>
            <td>
              {s.to} {s.jump && <span className="jumpbadge">jump</span>}
            </td>
            <td>{formatNumber(s.distance)}</td>
            <td>{formatNumber(s.cumulative)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}