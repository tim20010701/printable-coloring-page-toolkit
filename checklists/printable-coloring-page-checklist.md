# Checklist: turning a photo into a printable coloring page

A practical checklist for making a line-art coloring page from a photo and getting it
onto paper without wasting ink or card stock.

## 1. Pick the right photo

- [ ] One clear subject. Busy backgrounds turn into dense scribble once edges are extracted.
- [ ] Even lighting. Hard shadows get detected as edges and show up as heavy black patches.
- [ ] Good contrast between the subject and the background.
- [ ] The subject fills most of the frame — small subjects lose detail when scaled up.
- [ ] Resolution is at least as large as the print target (see `data/print-sizes.csv`).
      A 300 DPI A4 export is 2480 x 3508 px; upscaling a small photo will not add detail.

## 2. Convert to line art

- [ ] Start with a medium detail setting, then adjust rather than starting at an extreme.
- [ ] Increase detail for subjects with fine features (faces, fur, foliage).
- [ ] Decrease detail for very busy photos — fewer edges means a page a child can actually colour.
- [ ] Increase line thickness if the picture will be printed small, or if fine lines
      tend to disappear on your printer.
- [ ] Check the inverted preview too. Some photos read better as white lines on black,
      which also uses noticeably more ink — only choose it deliberately.

## 3. Choose the paper size

- [ ] A4 if you are outside the United States, US Letter if you are in the US or Canada.
      See `comparisons/a4-vs-us-letter.md` for what actually changes.
- [ ] Match the size to the paper already in your printer tray before exporting.

## 4. Export

- [ ] Export at 300 DPI for printing. 72-96 DPI is screen resolution and looks soft on paper.
- [ ] PDF if you want the file to open at exactly the right physical size on any machine.
- [ ] PNG if you want to drop the image into another document or resize it yourself.

## 5. Before you print a full run

- [ ] Print one copy on plain paper first.
- [ ] Check that the thinnest lines actually appear — if they do not, raise line thickness
      or lower detail and re-export.
- [ ] Check that no large area filled in solid black. If it did, lower the detail setting.
- [ ] Confirm your printer is not set to "fit to page" in a way that scales the image down
      and leaves white margins you did not intend.

## 6. Paper and supplies

- [ ] Plain 80-90 gsm copy paper is fine for crayons and coloured pencils.
- [ ] Heavier paper or card stock if markers, paint, or glue will be used.
- [ ] Keep a test sheet. Marker bleed varies a lot between paper brands.

## 7. If the page will be shared

- [ ] Confirm you own the photo or have permission to use it.
- [ ] Remember that a photo of a child is still personal data even after it becomes line art.
- [ ] Keep the original photo out of any upload unless you are certain where it is going.

---

## Where the numbers in this repo come from

- Pixel dimensions: computed. `width_px = width_in x dpi`, with 1 inch = 25.4 mm.
  A4 is 210 x 297 mm, US Letter is 8.5 x 11 in.
- The 300 DPI values (A4 2480 x 3508, US Letter 2550 x 3300) match what
  [AI Coloring Page Generator](https://photlin.com/) produces, which is where this
  checklist was written for.
- Paper weights: general office-paper practice, not a measured value. Treat the gsm
  suggestions as a starting point and test with your own printer.
