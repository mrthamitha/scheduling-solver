import { formatNumber } from '../utils.js';

const ITEMS = [
  ['avgWaiting', 'Avg waiting', ''],
  ['avgTurnaround', 'Avg turnaround', ''],
  ['avgResponse', 'Avg response', ''],
  ['contextSwitches', 'Context switches', ''],
  ['utilisation', 'CPU utilisation', '%'],
  ['idleTime', 'Idle time', ''],
  ['makespan', 'Makespan', ''],
];

export default function MetricsGrid({ metrics }) {
  if (!metrics) return null;
  return (
    <div className="metrics">
      {ITEMS.map(([key, label, unit]) => (
        <div key={key} className="metric">
          <span className="metric-value">
            {formatNumber(metrics[key])}
            {unit}
          </span>
          <span className="metric-label">{label}</span>
        </div>
      ))}
    </div>
  );
}