import { runDisk } from './algorithms/disk.js';

const CLASSIC = [98, 183, 37, 122, 14, 124, 65, 67];
const HEAD = 53;

const show = (label, res) => {
  console.log(`\n=== ${label} ===`);
  console.log('Order:  ', [res.head, ...res.order].join(' → '));
  console.log('Total:  ', res.total, '  Average:', res.average);
};

console.log(`Queue: ${CLASSIC.join(' ')}   |   Head: ${HEAD}`);

show('FCFS', runDisk('fcfs', CLASSIC, HEAD));
show('SSTF', runDisk('sstf', CLASSIC, HEAD));
show('SCAN (right)', runDisk('scan', CLASSIC, HEAD, { direction: 'right' }));
show('SCAN (left)', runDisk('scan', CLASSIC, HEAD, { direction: 'left' }));
show('C-SCAN (right)', runDisk('cscan', CLASSIC, HEAD, { direction: 'right' }));
show('LOOK (right)', runDisk('look', CLASSIC, HEAD, { direction: 'right' }));
show('C-LOOK (right)', runDisk('clook', CLASSIC, HEAD, { direction: 'right' }));
show('C-LOOK (left)', runDisk('clook', CLASSIC, HEAD, { direction: 'left' }));

show('SSTF (head 50)', runDisk('sstf', CLASSIC, 50));

console.log('\n──── COMPARE (classic queue, head 53) ────');
console.log('Algorithm        Total   Average');
for (const [label, res] of [
  ['FCFS', runDisk('fcfs', CLASSIC, HEAD)],
  ['SSTF', runDisk('sstf', CLASSIC, HEAD)],
  ['SCAN right', runDisk('scan', CLASSIC, HEAD, { direction: 'right' })],
  ['SCAN left', runDisk('scan', CLASSIC, HEAD, { direction: 'left' })],
  ['C-SCAN', runDisk('cscan', CLASSIC, HEAD, { direction: 'right' })],
  ['LOOK right', runDisk('look', CLASSIC, HEAD, { direction: 'right' })],
  ['C-LOOK right', runDisk('clook', CLASSIC, HEAD, { direction: 'right' })],
  ['C-LOOK left', runDisk('clook', CLASSIC, HEAD, { direction: 'left' })],
]) {
  console.log(label.padEnd(16), String(res.total).padStart(4), '  ', res.average);
}

console.log('\n──── jump flag එකේ රහස ────');
const cs = runDisk('cscan', CLASSIC, HEAD);
cs.steps.filter((s) => s.jump).forEach((s) => console.log(`  🚀 JUMP: ${s.from} → ${s.to}  (distance ${s.distance})`));