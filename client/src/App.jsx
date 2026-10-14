import { useEffect, useState } from 'react';
import { getAlgorithms, solve } from './api.js';
import { parseNumbers } from './utils.js';

export default function App() {
  const [mode, setMode] = useState('cpu');                 // 'cpu' | 'disk'
  const [algos, setAlgos] = useState({ cpu: [], disk: [] });
  const [algorithm, setAlgorithm] = useState('fcfs');

  const [arrival, setArrival] = useState('0 1 2 3');
  const [burst, setBurst] = useState('5 3 8 6');
  const [priorities, setPriorities] = useState('2 1 4 3');
  const [quantum, setQuantum] = useState('2');

  const [queue, setQueue] = useState('98 183 37 122 14 124 65 67');
  const [head, setHead] = useState('53');
  const [direction, setDirection] = useState('right');

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAlgorithms()
      .then((data) => setAlgos(data))
      .catch((err) => setError(err.message));
  }, []);

  const list = algos[mode] ?? [];
  const current = list.find((a) => a.id === algorithm);
  const needsPriority = mode === 'cpu' && Boolean(current?.needsPriority);
  const needsQuantum = mode === 'cpu' && Boolean(current?.needsQuantum);
  const needsDirection = mode === 'disk' && Boolean(current?.needsDirection);

  function switchMode(next) {
    setMode(next);
    setResult(null);
    setError('');
    setAlgorithm('fcfs');
  }

  function buildCpuBody() {
    const at = parseNumbers(arrival);
    const bt = parseNumbers(burst);
    if (!at.length || !bt.length) throw new Error('Arrival and burst times are required.');
    if (at.length !== bt.length) {
      throw new Error(`Counts must match: ${at.length} arrival times vs ${bt.length} burst times.`);
    }
    const pr = parseNumbers(priorities);
    return {
      type: 'cpu',
      algorithm,
      quantum: Number(quantum) || 2,
      processes: at.map((a, i) => ({ at: a, bt: bt[i], ...(pr.length ? { pr: pr[i] } : {}) })),
    };
  }

  function buildDiskBody() {
    const requests = parseNumbers(queue);
    if (!requests.length) throw new Error('Request queue is required.');
    return { type: 'disk', algorithm, requests, head: Number(head) || 0, direction };
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const body = mode === 'cpu' ? buildCpuBody() : buildDiskBody();
      setResult(await solve(body));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>Scheduling Solver</h1>
      <p className="sub">CPU &amp; Disk scheduling — step by step</p>

      <div className="tabs">
        <button className={mode === 'cpu' ? 'tab active' : 'tab'} onClick={() => switchMode('cpu')}>
          CPU scheduling
        </button>
        <button className={mode === 'disk' ? 'tab active' : 'tab'} onClick={() => switchMode('disk')}>
          Disk scheduling
        </button>
      </div>

      <form className="card" onSubmit={onSubmit}>
        <label htmlFor="algo">Algorithm</label>
        <select id="algo" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
          {list.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        {current?.description && <p className="hint">{current.description}</p>}

        {mode === 'cpu' ? (
          <>
            <div className="row">
              <div>
                <label htmlFor="arrival">Arrival times</label>
                <input id="arrival" value={arrival} onChange={(e) => setArrival(e.target.value)} placeholder="e.g. 0 1 2 3" />
              </div>
              <div>
                <label htmlFor="burst">Burst times</label>
                <input id="burst" value={burst} onChange={(e) => setBurst(e.target.value)} placeholder="e.g. 5 3 8 6" />
              </div>
            </div>

            {needsPriority && (
              <div>
                <label htmlFor="pr">Priorities (smaller number = higher priority)</label>
                <input id="pr" value={priorities} onChange={(e) => setPriorities(e.target.value)} placeholder="e.g. 2 1 4 3" />
              </div>
            )}

            {needsQuantum && (
              <div>
                <label htmlFor="q">Time quantum</label>
                <input id="q" value={quantum} onChange={(e) => setQuantum(e.target.value)} placeholder="e.g. 2" />
              </div>
            )}
          </>
        ) : (
          <>
            <label htmlFor="queue">Request queue (cylinders)</label>
            <input id="queue" value={queue} onChange={(e) => setQueue(e.target.value)} placeholder="e.g. 98 183 37 122" />

            <div className="row">
              <div>
                <label htmlFor="head">Head position</label>
                <input id="head" value={head} onChange={(e) => setHead(e.target.value)} placeholder="e.g. 53" />
              </div>
              {needsDirection && (
                <div>
                  <label htmlFor="dir">Direction</label>
                  <select id="dir" value={direction} onChange={(e) => setDirection(e.target.value)}>
                    <option value="right">right (towards high cylinders)</option>
                    <option value="left">left (towards 0)</option>
                  </select>
                </div>
              )}
            </div>
          </>
        )}

        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Solving…' : 'Solve'}
        </button>
        {error && <p className="error">⚠️ {error}</p>}
      </form>

      {result && <pre className="output">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}