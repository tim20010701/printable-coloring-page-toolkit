/**
 * Tests for tools/photo-to-line-art.js
 *
 * Run with: node --test test/
 *
 * The module takes plain {data, width, height} pixel data, so these tests need
 * no canvas, no browser, and no dependencies.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { toLineArt } from '../tools/photo-to-line-art.js';

const SIZE = 40;
const BOX = { x0: 10, y0: 10, x1: 30, y1: 30 }; // black square, half-open

/** White image with a solid black square. */
function squareImage() {
  const data = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const inside = x >= BOX.x0 && x < BOX.x1 && y >= BOX.y0 && y < BOX.y1;
      const v = inside ? 0 : 255;
      const i = (y * SIZE + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  return { data, width: SIZE, height: SIZE };
}

/** Solid uniform image. */
function uniformImage(v) {
  const data = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i + 1] = data[i + 2] = v;
    data[i + 3] = 255;
  }
  return { data, width: SIZE, height: SIZE };
}

function pixel(out, x, y) {
  const i = (y * SIZE + x) * 4;
  return { r: out[i], g: out[i + 1], b: out[i + 2], a: out[i + 3] };
}

function countInk(out) {
  let n = 0;
  for (let i = 0; i < out.length; i += 4) if (out[i] === 0) n++;
  return n;
}

/** True if any pixel in the horizontal window [x0, x1] on row y is ink. */
function inkInRowWindow(out, y, x0, x1) {
  for (let x = x0; x <= x1; x++) if (pixel(out, x, y).r === 0) return true;
  return false;
}

test('output shape and channel invariants', () => {
  const out = toLineArt(squareImage(), SIZE, SIZE, { detail: 55, thickness: 1 });
  assert.equal(out.length, SIZE * SIZE * 4, 'RGBA length');
  assert.ok(out instanceof Uint8ClampedArray, 'returns Uint8ClampedArray');
  for (let i = 3; i < out.length; i += 4) assert.equal(out[i], 255, 'alpha is opaque');
});

test('output is strictly binary black or white', () => {
  const out = toLineArt(squareImage(), SIZE, SIZE, { detail: 55, thickness: 1 });
  for (let i = 0; i < out.length; i += 4) {
    assert.ok(out[i] === 0 || out[i] === 255, `unexpected value ${out[i]}`);
    assert.equal(out[i], out[i + 1], 'r == g');
    assert.equal(out[i], out[i + 2], 'r == b');
  }
});

test('flat areas become paper, edges become ink', () => {
  const out = toLineArt(squareImage(), SIZE, SIZE, { detail: 55, thickness: 1 });
  assert.equal(pixel(out, 0, 0).r, 255, 'top-left corner is paper');
  assert.equal(pixel(out, 20, 20).r, 255, 'inside the square is paper');
  assert.equal(pixel(out, 39, 39).r, 255, 'bottom-right corner is paper');
  assert.ok(countInk(out) > 0, 'at least one ink pixel exists');
});

test('ink appears along the square boundary', () => {
  const out = toLineArt(squareImage(), SIZE, SIZE, { detail: 55, thickness: 1 });
  assert.ok(inkInRowWindow(out, 20, 8, 12), 'left edge detected near x=10');
  assert.ok(inkInRowWindow(out, 20, 28, 32), 'right edge detected near x=30');
});

test('a uniform image produces no ink', () => {
  const out = toLineArt(uniformImage(255), SIZE, SIZE, { detail: 55, thickness: 1 });
  assert.equal(countInk(out), 0, 'no edges in a flat image');
  const out2 = toLineArt(uniformImage(128), SIZE, SIZE, { detail: 90, thickness: 1 });
  assert.equal(countInk(out2), 0, 'no edges in a flat grey image either');
});

test('invert produces the exact complement', () => {
  const normal = toLineArt(squareImage(), SIZE, SIZE, { detail: 55, thickness: 1, invert: false });
  const inverted = toLineArt(squareImage(), SIZE, SIZE, { detail: 55, thickness: 1, invert: true });
  for (let i = 0; i < normal.length; i += 4) {
    assert.equal(inverted[i], 255 - normal[i], `pixel ${i / 4} is flipped`);
  }
});

test('higher detail never produces less ink', () => {
  let previous = -1;
  for (const detail of [10, 30, 55, 75, 90]) {
    const ink = countInk(toLineArt(squareImage(), SIZE, SIZE, { detail, thickness: 1 }));
    assert.ok(ink >= previous, `detail=${detail} ink=${ink} < previous ${previous}`);
    previous = ink;
  }
});

test('thicker lines never produce less ink', () => {
  let previous = -1;
  for (const thickness of [1, 2, 3, 4]) {
    const ink = countInk(toLineArt(squareImage(), SIZE, SIZE, { detail: 55, thickness }));
    assert.ok(ink >= previous, `thickness=${thickness} ink=${ink} < previous ${previous}`);
    previous = ink;
  }
});

test('a low-detail setting removes at least as much ink as a high one', () => {
  const low = countInk(toLineArt(squareImage(), SIZE, SIZE, { detail: 5, thickness: 1 }));
  const high = countInk(toLineArt(squareImage(), SIZE, SIZE, { detail: 95, thickness: 1 }));
  assert.ok(low <= high, `detail=5 ink=${low} should be <= detail=95 ink=${high}`);
});

test('output resolution follows the requested target size', () => {
  const out = toLineArt(squareImage(), 20, 10, { detail: 55, thickness: 1 });
  assert.equal(out.length, 20 * 10 * 4, 'honours targetWidth x targetHeight');
});

test('defaults are applied when options are omitted', () => {
  const out = toLineArt(squareImage(), SIZE, SIZE);
  assert.equal(out.length, SIZE * SIZE * 4);
  assert.ok(countInk(out) > 0, 'default options still detect the square');
});

test('non-square source scales to a square target without throwing', () => {
  const w = 60, h = 30;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = x > w / 2 ? 0 : 255;
      const i = (y * w + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  const out = toLineArt({ data, width: w, height: h }, 30, 30, { detail: 55, thickness: 1 });
  assert.equal(out.length, 30 * 30 * 4);
  assert.ok(countInk(out) > 0, 'vertical edge survives the resize');
});
