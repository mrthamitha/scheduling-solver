import { formatNumber } from '../utils.js';

/**
 * එකම input එකට හැම algorithm එකකුත් run කරලා, හොඳම අගය highlight කරනවා.
 * (මේ data එක එන්නේ server එකෙන් — frontend එක algorithm කිසිවක් දන්නේ නෑ!)
 */
const CPU_COLS = [
  ['avgWaiting', 'Avg waiting', 'min'],
  ['avgTurnaround', 'Avg turnaround', 'min'],
  ['avgResponse', 'Avg response', 'min'],
  ['contextSwitches', 'Context switches', 'min'],
  ['utilisation', 'Utilisation', 'max'],
];

const DISK_COLS = [
  ['total', 'Total seek', 'min'],
  ['average', 'Average', 'min'],
];

export default function CompareTable({ comparison, mode }) {
  if (!comparison?.length) return null;
  const cols = mode === 'cpu' ? CPU_COLS : DISK_COLS;

  // හැම column එකකටම හොඳම අගය කුමක්ද? (highlight කරන්න)
  const best = {};
  for (const [key, , direction] of cols) {
    const values = comparison
      .filter((c) => c.applicable)
      .map((c) => c[key])
      .filter((v) => typeof v === 'number');
    if (!values.length) continue;
    best[key] = direction === 'min' ? Math.min(...values) : Math.max(...values);
  }

  return (
    <table className="tbl compare">
      <thead>
        <tr>
          <th>Algorithm</th>
          {cols.map(([key, label]) => (
            <th key={key}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {comparison.map((c) => (
          <tr key={c.id} className={c.applicable ? undefined : 'muted-row'}>
            <td className="algo-name">{c.name}</td>
            {cols.map(([key, , direction]) => (
              <td key={key}>
                {!c.applicable ? (
                  <span className="na">{c.reason}</span>
                ) : (
                  <span className={c[key] === best[key] ? 'best' : undefined}>
                    {formatNumber(c[key])}
                    {direction === 'max' ? '%' : ''}
                  </span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}