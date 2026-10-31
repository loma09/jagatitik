import test from 'node:test';
import assert from 'node:assert/strict';
import { toHeatmapPoints } from '../src/utils/heatmap.ts';
test('heatmap preserves relative weights and excludes invalid or zero-weight locations', () => {
  assert.deepEqual(toHeatmapPoints([
    {lat:-6.2,lng:106.8,weight:2},
    {lat:-6.21,lng:106.81,weight:8},
    {lat:NaN,lng:106.8,weight:2},
    {lat:91,lng:106.8,weight:2},
    {lat:-6.2,lng:181,weight:2},
    {lat:-6.2,lng:106.8,weight:0},
    {lat:-6.2,lng:106.8,weight:-1},
    {lat:-6.2,lng:106.8,weight:Infinity},
  ]), [[-6.2,106.8,2],[-6.21,106.81,8]]);
});
test('empty heatmap stays empty rather than inventing reports', () => {
  assert.deepEqual(toHeatmapPoints([]), []);
});

test('zooming out shrinks the heat footprint instead of widening its geographic coverage', async () => {
  const { heatmapStyleForZoom } = await import('../src/utils/heatmap.ts');
  const local = heatmapStyleForZoom(12);
  const city = heatmapStyleForZoom(10);
  assert.equal(local.radius, 22);
  assert.equal(city.radius, 5.5);
  assert.equal(local.blur, 16);
  assert.equal(city.blur, 4);
  assert.equal(heatmapStyleForZoom(9).radius, 3);
  assert.equal(heatmapStyleForZoom(8).radius, 3);
  assert.equal(heatmapStyleForZoom(0).radius, 3);
  assert.equal(heatmapStyleForZoom(0).blur, 2);
});

test('canvas resize rejects zero or invalid dimensions and recovers for a visible map', async () => {
  const { hasDrawableMapSize } = await import('../src/utils/heatmap.ts');
  for (const [width,height] of [[0,500],[500,0],[0,0],[-1,500],[NaN,500],[500,Infinity]]) {
    assert.equal(hasDrawableMapSize(width,height),false);
  }
  assert.equal(hasDrawableMapSize(390,500),true);
  assert.equal(hasDrawableMapSize(1,1),true);
});
