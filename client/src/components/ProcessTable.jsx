import { formatNumber } from '../utils.js';

const COLS = [
  ['pid', 'Process'],
  ['at', 'Arrival'],
  ['bt', 'Burst'],
  ['start', 'Start'],
  ['completion', 'Completion'],
  ['turnaround', 'Turnaround'],
  ['waiting', 'Waiting'],
  ['response', 'Response'],
];

export default function ProcessTable({ processes, colorMap }) {
  if (!processes?.length) return null;
  return (
    <table className="tbl">
      <thead>
        <tr>
          {COLS.map(([key, label]) => (
            <th key={key}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {processes.map((p) => (
          <tr key={p.pid}>
            {COLS.map(([key]) => (
              <td key={key}>
                {key === 'pid' ? (
                  <span className="pill" style={{ background: colorMap[p.pid] }}>{p.pid}</span>
                ) : (
                  formatNumber(p[key])
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}