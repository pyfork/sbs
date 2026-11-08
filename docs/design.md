# sbs design

Status: first version built 2026-11-08. Paste, drop and browse to add images, pick which panel gets the paste, swap, horizontal and vertical layout, start over, copy image, download, light, dark and device themes. Checked in Chrome only. Not built: see the end.

## Shape

One file, `index.html`: HTML, CSS and JS together. No build step, no dependencies, no network calls. Everything runs in the browser and nothing is uploaded.

```
index.html             the whole app
docs/design.md         this file
tests/smoke.spec.js    Playwright tests at 1280 and 375 wide, run in Chrome
playwright.config.js   the two widths
```

## Settled decisions

- **Labels are fixed to position.** The first panel says LEFT and the second says RIGHT, in both layouts. When the images are stacked, LEFT is the top panel. The person says which side is the reference in their ask, and changes the ask when they paste the other way round. Role labels (BUILT and REFERENCE) and TOP and BOTTOM were mocked and rejected on 2026-11-08.
- **No label editor.** Follows from the line above.
- **Where paste goes.** Click a panel to pick it. It gets a blue outline and the line under the panels names it. With nothing picked, paste fills the first empty panel. A paste uses up the pick. With both panels full and nothing picked, paste starts a new pair. Picking a full panel and pasting replaces just that one.
- **Start over** clears both panels and the result. It keeps the layout (horizontal or vertical) and the theme.
- **Pasted images are named** `left.png` and `right.png`. The suggested output name is `<left name>_<right name>.png` and can be edited.
- **Icons are Heroicons only.** The outline set, inlined once as an SVG sprite at the top of the page. No icon fonts, no emoji, no unicode arrows.
- **Theme is light, dark or device settings.** Three icon buttons in the header. Device is the default and follows the system. Every colour is a token defined once with `light-dark()`.
- **The only thing saved is the theme choice**, in `localStorage` under `sbs-theme`. Device settings clears it. Nothing else is stored or sent anywhere.
- **Bars are green** (`#1db854`) with white bold monospace text, rotated -90 degrees in the horizontal layout. They are part of the image, so they do not follow the theme.

## How the image is built

Horizontal: both images are scaled to the taller height. Each gets a bar on its left. The bar is 8% of that height, never under 28px or over 220px, and the label font is 62% of the bar. Vertical works the same way with widths and a bar above each image. The smaller image is enlarged and can look soft. That is accepted.

## The hard parts

- **Canvas size limits.** Browsers cap canvas size. When the combined image is too big, `toDataURL` returns `data:,`. The page checks for that, tells the person, and keeps the result hidden instead of showing a blank image.
- **File names are text.** They come from the person's disk and can contain `<`. They are set with `textContent`, never put into HTML.
- **Listeners are attached once.** A panel's contents are replaced on every render, so the panel's own listeners (click, drag, drop, change) live on the panel. Attaching them again per render made one drop load the same file several times after a few resets.
- **Copy image.** The clipboard gets a `ClipboardItem` holding a promise for the blob, so Safari keeps the click. When the clipboard is missing (a non-secure page) the button says "copy blocked · use download".
- **Stale results.** Loading an image, clearing, swapping or starting over hides the result on screen, so an old image never sits under a new pair.
- **Browser support.** `light-dark()` needs a browser from 2024 or later. An older one loses the colours. Add a `prefers-color-scheme` fallback if that matters.

## Not built

Label editor, more than two images, reordering beyond swap, other saved settings, CI, an npm package.
