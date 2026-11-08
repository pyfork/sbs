import { test, expect } from '@playwright/test';

const url = `file://${process.cwd()}/index.html`;

async function paste(page, w, h) {
  await page.evaluate(async ({ w, h }) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d').fillRect(0, 0, w, h);
    const blob = await new Promise(r => c.toBlob(r));
    const dt = new DataTransfer();
    dt.items.add(new File([blob], 'image.png', { type: 'image/png' }));
    document.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, { w, h });
}

async function pastePair(page) {
  await paste(page, 240, 150);
  await expect(page.locator('#slotA.filled')).toHaveCount(1);
  await paste(page, 240, 150);
  await expect(page.locator('#slotB.filled')).toHaveCount(1);
}

test.beforeEach(async ({ page }) => {
  await page.goto(url);
});

test('two pasted images combine into one labelled image', async ({ page }) => {
  await pastePair(page);
  await page.click('#submitBtn');
  await expect(page.locator('#resultMeta')).toContainText('536 × 150px');
  await expect(page.locator('#filenameField')).toHaveValue('left_right.png');
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(sideways).toBe(false);
});

test('paste goes to the first empty panel and a third paste starts a new pair', async ({ page }) => {
  await expect(page.locator('#slotA.target')).toHaveCount(1);
  await pastePair(page);
  await expect(page.locator('.slot.target')).toHaveCount(0);
  await page.click('#submitBtn');
  await paste(page, 240, 150);
  await expect(page.locator('#slotB.filled')).toHaveCount(0);
  await expect(page.locator('#result')).not.toHaveClass(/show/);
  await expect(page.locator('#submitBtn')).toBeDisabled();
});

test('clicking a panel picks where paste goes', async ({ page }) => {
  await page.click('#slotB .label');
  await expect(page.locator('#slotB.target')).toHaveCount(1);
  await expect(page.locator('#pasteHint')).toContainText('RIGHT');
  await paste(page, 240, 150);
  await expect(page.locator('#slotB.filled')).toHaveCount(1);
  await expect(page.locator('#slotB .filename')).toHaveText('right.png');
  await expect(page.locator('#slotA.filled')).toHaveCount(0);
  await expect(page.locator('#slotA.target')).toHaveCount(1);
});

test('picking a filled panel replaces only that panel', async ({ page }) => {
  await pastePair(page);
  await page.click('#slotA .label');
  await paste(page, 100, 50);
  await expect.poll(() => page.evaluate(() => [state.A.img.width, state.B.img.width])).toEqual([100, 240]);
});

test('swap trades the two images and hides the old result', async ({ page }) => {
  await paste(page, 240, 150);
  await expect(page.locator('#slotA.filled')).toHaveCount(1);
  await paste(page, 100, 50);
  await expect(page.locator('#slotB.filled')).toHaveCount(1);
  await page.click('#submitBtn');
  await expect(page.locator('#result')).toHaveClass(/show/);
  await page.click('#swapBtn');
  await expect(page.locator('#result')).not.toHaveClass(/show/);
  await expect(page.locator('#slotA .filename')).toHaveText('right.png');
  await expect(page.locator('#slotB .filename')).toHaveText('left.png');
  expect(await page.evaluate(() => [state.A.img.width, state.B.img.width])).toEqual([100, 240]);
});

test('start over clears both panels and the result and keeps the layout', async ({ page }) => {
  await page.click('#modeV');
  await expect(page.locator('#resetBtn')).toBeDisabled();
  await pastePair(page);
  await page.click('#submitBtn');
  await expect(page.locator('#result')).toHaveClass(/show/);
  await page.click('#resetBtn');
  await expect(page.locator('.slot.filled')).toHaveCount(0);
  await expect(page.locator('#result')).not.toHaveClass(/show/);
  await expect(page.locator('#submitBtn')).toBeDisabled();
  await expect(page.locator('#resetBtn')).toBeDisabled();
  await expect(page.locator('#modeV')).toHaveClass(/active/);
});

test('start over can be repeated and a drop still loads once', async ({ page }) => {
  for (let i = 0; i < 3; i++) {
    await paste(page, 40, 40);
    await expect(page.locator('#slotA.filled')).toHaveCount(1);
    await page.click('#resetBtn');
    await expect(page.locator('#slotA.filled')).toHaveCount(0);
  }
  const loads = await page.evaluate(async () => {
    let n = 0;
    const orig = window.loadFile;
    window.loadFile = (...args) => { n++; return orig(...args); };
    const c = document.createElement('canvas');
    c.width = 40;
    c.height = 40;
    const blob = await new Promise(r => c.toBlob(r));
    const dt = new DataTransfer();
    dt.items.add(new File([blob], 'x.png', { type: 'image/png' }));
    document.getElementById('slotA').dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
    return n;
  });
  expect(loads).toBe(1);
});

test('a file name is shown as text and never run as HTML', async ({ page }) => {
  const name = '<img src=x onerror=window.__x=1>.png';
  await page.evaluate(async name => {
    const c = document.createElement('canvas');
    c.width = 40;
    c.height = 40;
    const blob = await new Promise(r => c.toBlob(r));
    loadFile('A', new File([blob], name, { type: 'image/png' }));
  }, name);
  await expect(page.locator('#slotA .filename')).toHaveText(name);
  await expect(page.locator('#slotA img[src="x"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.__x)).toBeUndefined();
});

test('light, dark and device themes, and the choice is remembered', async ({ page }) => {
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.click('#theme [data-pick="dark"]');
  const dark = await bg();
  await page.click('#theme [data-pick="light"]');
  const light = await bg();
  expect(dark).not.toBe(light);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#theme [data-pick="light"]')).toHaveClass(/active/);
  await page.click('#theme [data-pick="device"]');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await bg()).toBe(dark);
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await bg()).toBe(light);
});
