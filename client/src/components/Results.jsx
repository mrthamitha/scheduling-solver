import GanttChart from './GanttChart.jsx';
import MetricsGrid from './MetricsGrid.jsx';
import ProcessTable from './ProcessTable.jsx';
import HeadMovementChart from './HeadMovementChart.jsx';
import DiskTable from './DiskTable.jsx';
import CompareTable from './CompareTable.jsx';
import { buildColorMap } from '../utils.js';

export default function Results({ result }) {
  if (!result) return null;

  if (result.type === 'cpu') {
    const colorMap = buildColorMap(result.processes.map((p) => p.pid));
    return (
      <section className="results">
        <h2>
          {result.algorithmName}
          {result.quantum ? ` · quantum ${result.quantum}` : ''}
        </h2>

        <GanttChart gantt={result.gantt} colorMap={colorMap} />
        <MetricsGrid metrics={result.metrics} />

        <h3>Per-process results</h3>
        <ProcessTable processes={result.processes} colorMap={colorMap} />

        <h3>All algorithms on the same input</h3>
        <CompareTable comparison={result.comparison} mode="cpu" />
      </section>
    );
  }

  // disk
  return (
    <section className="results">
      <h2>{result.algorithmName} · direction: {result.direction}</h2>

      <p className="order-line">
        <strong>Order:</strong> {[result.head, ...result.order].join(' → ')}
      </p>
      <p className="order-line">
        <strong>Total seek distance:</strong> {result.total} cylinders · <strong>Average:</strong> {result.average}
      </p>

      <HeadMovementChart steps={result.steps} head={result.head} maxCylinder={result.maxCylinder} />

      <h3>Movement, step by step</h3>
      <DiskTable steps={result.steps} />

      <h3>All algorithms on the same queue</h3>
      <CompareTable comparison={result.comparison} mode="disk" />
    </section>
  );
}