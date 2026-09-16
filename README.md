# printable-coloring-page-toolkit

Reference data, checklists, and a dependency-free JavaScript module for turning photos
into printable black-and-white coloring pages.

This repo exists because the same numbers and the same conversion steps come up every time
you make a coloring page from a photo: how many pixels is A4 at 300 DPI, how much detail
survives edge detection, why a page prints with unexpected margins. The answers are small
and easy to recompute, so they are written down here instead of being re-derived each time.

## Contents

| Path | What it is |
|---|---|
| `data/print-sizes.csv` | A4 and US Letter pixel dimensions from 72 to 600 DPI |
| `checklists/printable-coloring-page-checklist.md` | Step-by-step checklist from picking a photo to printing it |
| `comparisons/a4-vs-us-letter.md` | What actually differs between the two page sizes, with the arithmetic |
| `tools/photo-to-line-art.js` | Zero-dependency ES module: photo to black-and-white line art |
| `test/photo-to-line-art.test.mjs` | 12 unit tests for the module, no dependencies |

## The data

`data/print-sizes.csv` is generated, not copied from anywhere. Every row is

```
width_px  = round(width_in  x dpi)
height_px = round(height_in x dpi)
```

with 1 inch = 25.4 mm, A4 = 210 x 297 mm (ISO 216), US Letter = 8.5 x 11 in (ANSI Y14.1).

Two rows worth quoting:

- A4 at 300 DPI: **2480 x 3508 px**
- US Letter at 300 DPI: **2550 x 3300 px**

## The tool

`tools/photo-to-line-art.js` implements the usual pipeline — area-average downscale to
grayscale, Sobel edge magnitude, threshold, optional line thickening and inversion. It has
no dependencies and makes no network requests, so it can run in a browser or in Node with a
canvas shim.

```js
import { toLineArt } from './tools/photo-to-line-art.js';

const pixels = toLineArt(imageData, 2480, 3508, {
  detail: 55,     // 0-100, higher keeps more edges
  thickness: 2,   // 1-4, thickness in output pixels
  invert: false,  // true = white lines on black
});
// pixels is Uint8ClampedArray RGBA, ready for putImageData
```

`detail` is mapped to a threshold on normalised edge strength: `threshold = 100 - detail`.
That is a deliberate simplification — it makes the control behave predictably across
photos, at the cost of not being adaptive to image contrast.

Because nothing leaves the browser, a photo passed to this module is not uploaded anywhere.

## Tests

```sh
node --test
```

12 tests cover the output invariants (RGBA length, opaque alpha, strictly black-or-white
output), the behaviour that matters in use (flat areas become paper, edges become ink, a
uniform image produces no ink at all, `invert` is the exact complement), and the monotonic
properties of the two controls (raising `detail` or `thickness` never reduces the amount of
ink). They run on synthetic pixel data, so no browser, canvas, or image files are needed.

## Why this is here

These files were written alongside [AI Coloring Page Generator](https://photlin.com/), a
free browser tool that converts a photo into a printable coloring page; the 300 DPI values
above match what it exports. You do not need that site to use anything in this repo.

## License

MIT. See `LICENSE`.
