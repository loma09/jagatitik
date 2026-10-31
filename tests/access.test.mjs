import test from 'node:test';
import assert from 'node:assert/strict';
import { canReport } from '../src/utils/access.ts';
test('only authenticated reporter and admin profiles can open reporting controls', () => {
  assert.equal(canReport('warga'), true);
  assert.equal(canReport('pelapor'), true);
  assert.equal(canReport('admin'), true);
  assert.equal(canReport(null), false);
  assert.equal(canReport('pengguna'), false);
  assert.equal(canReport('unknown'), false);
});
