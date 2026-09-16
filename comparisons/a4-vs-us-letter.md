# A4 vs US Letter for printable coloring pages

## The physical difference

| | A4 | US Letter |
|---|---|---|
| Size | 210 x 297 mm | 8.5 x 11 in |
| Size in inches | 8.268 x 11.693 in | 8.5 x 11.0 in |
| Size in millimetres | 210 x 297 mm | 215.9 x 279.4 mm |
| Aspect ratio | 1 : 1.4142 (sqrt 2) | 1 : 1.2941 |
| Area | 62,370 mm² | 60,322 mm² |

Derivations:

- A4 in inches: 210 / 25.4 = 8.2677 in, 297 / 25.4 = 11.6929 in.
- Letter in millimetres: 8.5 x 25.4 = 215.9 mm, 11 x 25.4 = 279.4 mm.
- Areas: 210 x 297 = 62,370 mm²; 215.9 x 279.4 = 60,322 mm².
- A4 is about 3.4% larger in area: 62,370 / 60,322 = 1.0339.

## What that means in practice

**A4 is taller and narrower. Letter is shorter and wider.** Because the aspect ratios
differ (1.414 vs 1.294), a picture drawn to fill one page will not fill the other:

- Fitting an A4 page onto Letter: the height is the binding constraint, so the image is
  scaled to 279.4 / 297 = 0.941 of its size, leaving side margins.
- Fitting a Letter page onto A4: the width is the binding constraint, so the image is
  scaled to 210 / 215.9 = 0.973 of its size, leaving top and bottom margins.

Either way you lose a little, so it is worth exporting at the size your printer actually
takes rather than rescaling at print time.

## Pixel dimensions at common DPI

Full table in `data/print-sizes.csv`. The two rows that matter most for printing:

| Paper | 150 DPI | 300 DPI | 600 DPI |
|---|---|---|---|
| A4 | 1240 x 1754 | **2480 x 3508** | 4961 x 7016 |
| US Letter | 1275 x 1650 | **2550 x 3300** | 5100 x 6600 |

300 DPI is the usual target for something that will be printed and looked at closely.
600 DPI quadruples the file size for a difference most home printers will not show.

## Which one should you use

Pick by where the page will be printed, not by preference:

- United States and Canada: US Letter is the default paper in virtually every shop and
  home printer.
- Most of the rest of the world: A4 is the default.

If you are making a page for someone else, ask which one their printer takes. If you are
making a page to sell or share publicly, exporting both is cheap and removes the guesswork.

## Note on sources

- A4 dimensions are defined by ISO 216 (210 x 297 mm).
- US Letter dimensions are defined by ANSI Y14.1 (8.5 x 11 in).
- The 300 DPI pixel values above match the output of
  [AI Coloring Page Generator](https://photlin.com/), which exports both sizes at 300 DPI.
- The regional defaults in the last section reflect common practice in those markets, not
  a formal standard — if you are printing somewhere unusual, check the paper.
