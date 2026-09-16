/**
 * photo-to-line-art
 * Browser-side conversion of a photo into printable black-and-white line art.
 *
 * Pipeline: downscale -> grayscale -> Sobel edge magnitude -> threshold -> optional invert.
 * No dependencies, no network calls, works in any browser with canvas support.
 *
 * MIT licensed.
 */

/** @typedef {{data: Uint8ClampedArray, width: number, height: number}} ImageDataLike */

/**
 * Convert a source image into black-and-white line art.
 *
 * @param {ImageDataLike} source  Pixel data of the source photo.
 * @param {number} targetWidth    Width of the output in pixels.
 * @param {number} targetHeight   Height of the output in pixels.
 * @param {object} [options]
 * @param {number} [options.detail=55]      0-100. Higher keeps more edges (busier picture).
 * @param {number} [options.thickness=2]    1-4. Line thickness in output pixels.
 * @param {boolean} [options.invert=false]  true = white lines on black.
 * @returns {Uint8ClampedArray} RGBA bytes, 4 per pixel.
 */
export function toLineArt(source, targetWidth, targetHeight, options = {}) {
  const { detail = 55, thickness = 2, invert = false } = options;

  const gray = toGrayscale(source, targetWidth, targetHeight);
  const edges = sobelMagnitude(gray, targetWidth, targetHeight);

  // detail 0..100 maps to a threshold on edge strength.
  // Higher detail -> lower threshold -> more edges survive.
  const threshold = 100 - clamp(detail, 0, 100);

  const ink = invert ? 255 : 0;
  const paper = invert ? 0 : 255;
  const out = new Uint8ClampedArray(targetWidth * targetHeight * 4);

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const i = y * targetWidth + x;
      let isInk = edges[i] > threshold;

      if (!isInk && thickness > 1) {
        isInk = neighbourIsInk(edges, x, y, targetWidth, targetHeight, threshold, thickness);
      }

      const value = isInk ? ink : paper;
      const o = i * 4;
      out[o] = value;
      out[o + 1] = value;
      out[o + 2] = value;
      out[o + 3] = 255;
    }
  }
  return out;
}

/**
 * Area-average downscale plus Rec. 601 luma conversion.
 * @returns {Float32Array} one grayscale value per pixel, 0-255.
 */
function toGrayscale(source, targetWidth, targetHeight) {
  const { data, width, height } = source;
  const out = new Float32Array(targetWidth * targetHeight);

  for (let y = 0; y < targetHeight; y++) {
    const sy0 = Math.floor((y * height) / targetHeight);
    const sy1 = Math.max(sy0 + 1, Math.floor(((y + 1) * height) / targetHeight));
    for (let x = 0; x < targetWidth; x++) {
      const sx0 = Math.floor((x * width) / targetWidth);
      const sx1 = Math.max(sx0 + 1, Math.floor(((x + 1) * width) / targetWidth));

      let sum = 0;
      let count = 0;
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          const i = (sy * width + sx) * 4;
          sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          count++;
        }
      }
      out[y * targetWidth + x] = count ? sum / count : 0;
    }
  }
  return out;
}

/**
 * Sobel operator. Returns normalised edge strength 0-255 per pixel.
 */
function sobelMagnitude(gray, width, height) {
  const out = new Float32Array(width * height);
  let max = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const g = (dx, dy) => gray[(y + dy) * width + (x + dx)];

      const gx =
        -1 * g(-1, -1) + 1 * g(1, -1) +
        -2 * g(-1, 0) + 2 * g(1, 0) +
        -1 * g(-1, 1) + 1 * g(1, 1);

      const gy =
        -1 * g(-1, -1) - 2 * g(0, -1) - 1 * g(1, -1) +
        1 * g(-1, 1) + 2 * g(0, 1) + 1 * g(1, 1);

      const value = Math.sqrt(gx * gx + gy * gy);
      out[y * width + x] = value;
      if (value > max) max = value;
    }
  }

  if (max > 0) {
    for (let i = 0; i < out.length; i++) out[i] = (out[i] / max) * 255;
  }
  return out;
}

/** Thicken lines by checking whether a nearby pixel crossed the threshold. */
function neighbourIsInk(edges, x, y, width, height, threshold, thickness) {
  const r = Math.min(thickness - 1, 3);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (edges[ny * width + nx] > threshold) return true;
    }
  }
  return false;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default toLineArt;
