# sbs design

Status: first version built 2026-11-08. Paste, drop and browse to add images, pick which panel gets the paste, swap, horizontal and vertical layout, start over, copy image, download, light, dark and device themes. Checked in Chrome only. Not built: see the end.

Design upgrade accepted 2026-11-08: see "Accepted look and flow". It is a working mock (option 3 v2, in the private `docs/` folder) and is not in `index.html` yet.

## Shape

One file, `index.html`: HTML, CSS and JS together. No build step, no dependencies, no network calls. Everything runs in the browser and nothing is uploaded.

```
index.html             the whole app
docs-public/design.md  this file
tests/smoke.spec.js    Playwright tests at 1280 and 375 wide, run in Chrome
playwright.config.js   the two widths
```

## Settled decisions

- **Labels are fixed to position.** The first panel says LEFT and the second says RIGHT, in both layouts. When the images are stacked, LEFT is the top panel. The person says which side is the reference in their ask, and changes the ask when they paste the other way round. Role labels (BUILT and REFERENCE) and TOP and BOTTOM were mocked and rejected on 2026-11-08.
- **No label editor.** Follows from the line above.
- **Labels can be turned off.** Accepted 2026-11-08, not built yet: a checkbox "Add text labels to the output", on by default. Unticked, the two images are joined with no bars. The words stay LEFT and RIGHT; only on or off is offered.
- **Where paste goes.** Click a panel to pick it. It gets a blue outline and the line under the panels names it. With nothing picked, paste fills the first empty panel. A paste uses up the pick. With both panels full and nothing picked, paste starts a new pair. Picking a full panel and pasting replaces just that one.
- **Start over** clears both panels and the result. It keeps the layout (horizontal or vertical) and the theme.
- **Pasted images are named** `left.png` and `right.png`. The suggested output name is `<left name>_<right name>.png` and can be edited.
- **Icons are Heroicons only.** The outline set, inlined once as an SVG sprite at the top of the page. No icon fonts, no emoji, no unicode arrows.
- **Theme is light, dark or device settings.** Three icon buttons in the header. Device is the default and follows the system. Every colour is a token defined once with `light-dark()`.
- **The only thing saved is the theme choice**, in `localStorage` under `sbs-theme`. Device settings clears it. Nothing else is stored or sent anywhere.
- **Bars are green** (`#1db854`) with white bold monospace text, rotated -90 degrees in the horizontal layout. They are part of the image, so they do not follow the theme.

## Accepted look and flow (2026-11-08, not built yet)

Chosen from four looks, each after a sign-up page (HoverSpeech, Argos, Ahrefs, Semrush). The owner picked option 3, after Ahrefs, and its second version.

- **Page.** Electric blue page (`#3a57fc`), top left "SBS - Join two images" in white. One square white card, 880px wide, starting 104px from the top. Fonts: Space Grotesk (stand-in for the Ahrefs face) and Inter. The landing page must not scroll at 1280x900, 1280x800 or 1366x768; the image boxes get shorter on short screens to fit.
- **Card 1.** Heading "Side by side", with a small Start over button at the card's top right (placement B, picked on a board of six). Under it: Horizontal and Vertical as two checkbox-style choices that act as one toggle, text only, then the labels checkbox. Then "Left image" and "Right image" boxes with a round swap icon between them and no swap text. Each empty box says "paste or drop" over a "Browse image" pill button; only the pill opens the file picker. Under the box the next paste goes to: "Paste goes here". Then the orange Append button (72px tall).
- **Where paste goes, with the keyboard.** Left and right arrow keys move the paste box. The paste box and keyboard focus are one thing (roving focus): Tab lands on the paste box, arrows move both, focusing a box makes it the paste box, and after a paste fills the box you are on, focus moves to the next empty one. Only one box is ever highlighted. When focus is on another control, arrows move the paste box and leave focus where it is.
- **One focus colour.** Blue on the white card, white on the blue page, 3px. Orange means only the main button.
- **Card 2, the result.** "Your image" with Back and Start over at its top right, the preview (shrinks on short screens; the download is always full size), file name, Copy image, Copy file name, and an orange Download button.
- **Motion.** Append slides a two-card carousel left in 0.9 s, the content inside each card trailing it by 160px (56px on phones), and the card that leaves dims. Back slides it the other way, with both images kept. Start over (on either card) is different on purpose: the card in view sinks 56px and fades, then a fresh empty card drops in from above. Plain CSS transitions and the Web Animations API, no library.
- **Accessibility.** The card that is away is `inert` and hidden once it has left. After Append, focus goes to "Your image"; after Back or Start over, to the paste box. "Reduce motion" gives an instant switch. Every step has a button, so nothing depends on seeing the motion.
- **Two more Heroicons** are needed: arrow-left (Back) and arrow-up-tray (Browse image).
- **Open.** The fonts load from Google in the mock, which breaks "no network calls". Before building, either name the fonts with system fallbacks and no download, or inline the font files in `index.html`. Not yet tried: Safari, Firefox, VoiceOver.

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
