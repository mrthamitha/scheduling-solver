/**
 * tests/algorithms.test.js
 * ==================================================================
 * ධාවනය කරන්න:  npm test
 *
 * මේක තමයි "test-driven" වැඩ කරන ආකාරයේ පළවෙනි පාඩම:
 * අපි මුලින්ම "හරි උත්තරය මොකක්ද" කියලා ලියනවා (textbook උදාහරණ වලින්),
 * ඊට පස්සේ code එක ලියලා ඒ උත්තරය එනකම් හදනවා.
 * ==================================================================
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { runCpu } from '../src/algorithms/cpu.js';
import { runDisk } from '../src/algorithms/disk.js';

/* ── කෙටි උපකාරක ────────────────────────────────────────── */
const ganttString = (gantt) =>
  gantt.map((s) => `${s.idle ? 'Idle' : s.pid}:${s.start}-${s.end}`).join(' ');

const column = (result, key) => result.processes.map((p) => p[key]).join(',');

const P = (rows) => rows.map(([at, bt, pr]) => ({ at, bt, pr }));

/* ==================== CPU ==================== */

test('FCFS — serves in arrival order', () => {
  const r = runCpu('fcfs', P([[0, 5], [1, 3], [2, 8], [3, 6]]));
  assert.equal(ganttString(r.gantt), 'P1:0-5 P2:5-8 P3:8-16 P4:16-22');
  assert.equal(column(r, 'waiting'), '0,4,6,13');
});

test('FCFS — metrics add up', () => {
  const r = runCpu('fcfs', P([[0, 5], [1, 3], [2, 8], [3, 6]]));
  assert.equal(r.metrics.avgWaiting, 5.75);
  assert.equal(r.metrics.avgTurnaround, 11.25);
  assert.equal(r.metrics.makespan, 22);
  assert.equal(r.metrics.contextSwitches, 3);
  assert.equal(r.metrics.utilisation, 100);
});

test('FCFS — CPU idle before the first arrival', () => {
  const r = runCpu('fcfs', P([[3, 4]]));
  assert.equal(ganttString(r.gantt), 'Idle:0-3 P1:3-7');
  assert.equal(r.metrics.utilisation, 57.14);
  assert.equal(r.metrics.idleTime, 3);
});

test('SJF — shortest job first beats FCFS', () => {
  const r = runCpu('sjf', P([[0, 5], [1, 3], [2, 8], [3, 6]]));
  assert.equal(ganttString(r.gantt), 'P1:0-5 P2:5-8 P4:8-14 P3:14-22');
  assert.equal(r.metrics.avgWaiting, 5.25);
});

test('SRTF — preemption splits a process into two blocks', () => {
  const r = runCpu('srtf', P([[0, 8], [1, 4], [2, 9], [3, 5]]));
  assert.equal(ganttString(r.gantt), 'P1:0-1 P2:1-5 P4:5-10 P1:10-17 P3:17-26');
  assert.equal(column(r, 'waiting'), '9,0,15,2');
});

test('SRTF — response time is measured at the FIRST run, not the last', () => {
  const r = runCpu('srtf', P([[0, 8], [1, 4], [2, 9], [3, 5]]));
  assert.equal(column(r, 'response'), '0,0,15,2');   // P1 waits 9 but responds at 0!
  assert.equal(r.metrics.avgResponse, 4.25);
});

test('Round Robin — rotation with quantum 2', () => {
  const r = runCpu('rr', P([[0, 5], [0, 4], [0, 2]]), { quantum: 2 });
  assert.equal(ganttString(r.gantt), 'P1:0-2 P2:2-4 P3:4-6 P1:6-8 P2:8-10 P1:10-11');
  assert.equal(column(r, 'turnaround'), '11,10,6');
  assert.equal(column(r, 'waiting'), '6,6,4');
});

test('Round Robin — one process keeps every quantum block visible', () => {
  const r = runCpu('rr', P([[0, 5]]), { quantum: 2 });
  assert.equal(ganttString(r.gantt), 'P1:0-2 P1:2-4 P1:4-5');
  assert.equal(r.metrics.contextSwitches, 0);
});

test('Round Robin — a quantum bigger than every burst behaves like FCFS', () => {
  const procs = P([[0, 5], [1, 3], [2, 8], [3, 6]]);
  const rr = runCpu('rr', procs, { quantum: 10 });
  const fcfs = runCpu('fcfs', procs);
  assert.equal(ganttString(rr.gantt), ganttString(fcfs.gantt));
  assert.equal(rr.metrics.avgWaiting, fcfs.metrics.avgWaiting);
});

test('Priority (preemptive) — a higher priority arrival preempts', () => {
  const r = runCpu('priority-p', P([[0, 4, 2], [1, 3, 1], [2, 7, 4], [3, 2, 3]]));
  assert.equal(ganttString(r.gantt), 'P1:0-1 P2:1-4 P1:4-7 P4:7-9 P3:9-16');
});

test('Priority (non-preemptive) — runs to completion', () => {
  const r = runCpu('priority-np', P([[0, 4, 2], [1, 3, 1], [2, 7, 4], [3, 2, 3]]));
  // P1 දැනටමත් දුවනවා (priority 2) — P2 (priority 1) ඉහළම වුනත් බලා ඉන්න ඕන.
  assert.equal(ganttString(r.gantt), 'P1:0-4 P2:4-7 P4:7-9 P3:9-16');
});

test('HRRN — a long waiter slowly wins', () => {
  const r = runCpu('hrrn', P([[0, 2], [1, 6], [2, 3]]));
  assert.equal(ganttString(r.gantt), 'P1:0-2 P2:2-8 P3:8-11');
});

test('HRRN — textbook example', () => {
  const r = runCpu('hrrn', P([[0, 5], [1, 3], [2, 8], [3, 6]]));
  assert.equal(ganttString(r.gantt), 'P1:0-5 P2:5-8 P4:8-14 P3:14-22');
  assert.equal(r.metrics.avgWaiting, 5.25);
});

test('Unknown CPU algorithm throws a clear error', () => {
  assert.throws(() => runCpu('fcfs-lite', P([[0, 1]])), /not implemented/);
});

/* ==================== DISK ==================== */

const CLASSIC = [98, 183, 37, 122, 14, 124, 65, 67];

test('Disk FCFS — serves in arrival order', () => {
  const r = runDisk('fcfs', CLASSIC, 53);
  assert.equal(r.total, 640);
  assert.deepEqual(r.order, CLASSIC);
});

test('Disk SSTF — closest request each time', () => {
  const r = runDisk('sstf', CLASSIC, 53);
  assert.equal(r.total, 236);
  assert.deepEqual(r.order, [65, 67, 37, 14, 98, 122, 124, 183]);
});

test('Disk SSTF — second classic queue', () => {
  const r = runDisk('sstf', [176, 79, 34, 60, 92, 11, 41, 114], 50);
  assert.equal(r.total, 204);
});

test('Disk SCAN — travels to the end of the disk', () => {
  const right = runDisk('scan', CLASSIC, 53, { direction: 'right' });
  assert.equal(right.total, 331);
  assert.deepEqual(right.order, [65, 67, 98, 122, 124, 183, 199, 37, 14]);

  const left = runDisk('scan', CLASSIC, 53, { direction: 'left' });
  assert.equal(left.total, 236);
  assert.deepEqual(left.order, [37, 14, 0, 65, 67, 98, 122, 124, 183]);
});

test('Disk C-SCAN — marks the return jump', () => {
  const r = runDisk('cscan', CLASSIC, 53, { direction: 'right' });
  assert.equal(r.total, 382);
  assert.equal(r.steps.some((s) => s.jump), true);
});

test('Disk LOOK and C-LOOK — never reach the disk edge', () => {
  assert.equal(runDisk('look', CLASSIC, 53, { direction: 'right' }).total, 299);
  assert.equal(runDisk('clook', CLASSIC, 53, { direction: 'right' }).total, 322);
  assert.equal(runDisk('clook', CLASSIC, 53, { direction: 'left' }).total, 326);
});

test('Disk — cumulative distance is the running total', () => {
  const r = runDisk('fcfs', [10, 200], 0);
  assert.equal(r.steps[0].cumulative, 10);
  assert.equal(r.steps[1].cumulative, 200);
  assert.equal(r.total, 200);
});

test('Every request is served exactly once (no lost requests)', () => {
  const queue = [42, 7, 199, 100, 0];
  for (const algo of ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook']) {
    const r = runDisk(algo, queue, 90, { direction: 'right' });
    const served = [...r.order].filter((v) => queue.includes(v)).sort((a, b) => a - b);
    assert.deepEqual(served, [...new Set(queue)].sort((a, b) => a - b), `${algo} lost a request`);
  }
});