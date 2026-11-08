# sbs contributor instructions

Read `docs-public/design.md` before changing behaviour. `README.md` says what the tool is for.

- `index.html` is the whole app. Keep it one file with no dependencies and no network calls.
- Labels stay LEFT and RIGHT in both layouts. Don't add a label editor or role labels; the settled decisions are in `docs-public/design.md`.
- Icons are Heroicons only, inlined as `<symbol>`s at the top of `index.html`. No icon fonts, emoji or unicode arrows.
- Colours come from the tokens at the top of the CSS, each defined once with `light-dark()`. Check light and dark.
- File names go into the page as text, never as HTML.
- Check UI changes at 1280 and 375 wide for sideways scroll and overlaps. `npm test` does it, in Google Chrome (`npx playwright install chrome` if you don't have it).
- Tests and screenshots use made-up images only.
- Keep implemented, verified and accepted separate. A passing test is not the owner's acceptance.
