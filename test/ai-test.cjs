// Runs the real AI selection on real photos and records what gets selected.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = 'test/out'; fs.mkdirSync(OUT, { recursive: true });
const CASES = [
  ['chelsea', [[150, 150], [250, 240], [80, 80]]],
  ['astronaut', [[200, 330], [230, 140], [380, 420], [450, 380], [130, 60]]],
  ['coffee', [[300, 140], [150, 260], [240, 230], [370, 220]]],
  ['rocket', [[338, 250], [338, 160]]],
];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 2 });
  const logs = []; p.on('console', m => logs.push(m.type() + ': ' + m.text())); p.on('pageerror', e => logs.push('pageerror: ' + e.message));
  await p.addInitScript(() => { window.Capacitor = { isNativePlatform: () => true, nativePromise: async () => ({}) }; });
  await p.goto('http://localhost:8765/');
  for (let i = 0; i < 120; i++) { const s = await p.evaluate(() => window.__gzState().ai); if (s === 'ready' || s === 'failed') break; await p.waitForTimeout(500); }
  const results = { ai: await p.evaluate(() => window.__gzState().ai), cases: [] };
  for (const [name, taps] of CASES) {
    for (const [tx, ty] of taps) {
      await p.setInputFiles('#file', `test/photos/${name}.jpg`); await p.waitForTimeout(600);
      await p.click('#mWand'); await p.click('#tTap');
      await p.evaluate(({ tx, ty }) => {
        const v = window.__gzState().view, cv = document.getElementById('cv'), r = cv.getBoundingClientRect();
        const o = { pointerId: 7, isPrimary: true, bubbles: true, pointerType: 'touch', clientX: r.left + v.ox + tx * v.s, clientY: r.top + v.oy + ty * v.s };
        cv.dispatchEvent(new PointerEvent('pointerdown', o)); cv.dispatchEvent(new PointerEvent('pointerup', o));
      }, { tx, ty });
      await p.waitForTimeout(1500);
      const st = await p.evaluate(() => ({ s: window.__gzState(), d: window.__aiDebug, toast: document.getElementById('toast').textContent }));
      const file = `${name}_${tx}_${ty}.png`;
      await p.locator('#cv').screenshot({ path: `${OUT}/${file}` });
      results.cases.push({ name, tap: [tx, ty], selectedFrac: st.s.count / (st.s.k * st.s.k) , count: st.s.count, debug: st.d, toast: st.toast, file });
      await p.evaluate(() => { window.__aiDebug = null; });
    }
  }
  // Re-cut scenario: cut the person, then tap the same spot again
  const tap = async (tx, ty) => p.evaluate(({ tx, ty }) => {
    const v = window.__gzState().view, cv = document.getElementById('cv'), r = cv.getBoundingClientRect();
    const o = { pointerId: 7, isPrimary: true, bubbles: true, pointerType: 'touch', clientX: r.left + v.ox + tx * v.s, clientY: r.top + v.oy + ty * v.s };
    cv.dispatchEvent(new PointerEvent('pointerdown', o)); cv.dispatchEvent(new PointerEvent('pointerup', o));
  }, { tx, ty });
  await p.setInputFiles('#file', 'test/photos/astronaut.jpg'); await p.waitForTimeout(600);
  await p.click('#mWand'); await p.click('#tTap'); await tap(200, 330); await p.waitForTimeout(1500);
  await p.locator('#cv').screenshot({ path: `${OUT}/edge_selection.png`, scale: 'device' });
  await p.click('#wCut'); await p.waitForTimeout(500);
  const afterCut = await p.evaluate(() => window.__gzState().objects);
  await p.click('#mWand'); await tap(200, 330); await p.waitForTimeout(1500);
  await p.click('#wCut'); await p.waitForTimeout(500);
  const re = await p.evaluate(() => ({ objects: window.__gzState().objects, move: document.getElementById('mMove').getAttribute('aria-pressed'), toast: document.getElementById('toast').textContent }));
  // drag the piece aside to see its edges and what was left behind
  await p.evaluate(() => {
    const v = window.__gzState().view, cv = document.getElementById('cv'), r = cv.getBoundingClientRect();
    const pt = (x, y) => ({ pointerId: 8, isPrimary: true, bubbles: true, pointerType: 'touch', clientX: r.left + v.ox + x * v.s, clientY: r.top + v.oy + y * v.s });
    cv.dispatchEvent(new PointerEvent('pointerdown', pt(200, 330)));
    for (let i = 1; i <= 10; i++) cv.dispatchEvent(new PointerEvent('pointermove', pt(200 + i * 25, 330)));
    cv.dispatchEvent(new PointerEvent('pointerup', pt(450, 330)));
  });
  await p.waitForTimeout(300);
  await p.locator('#cv').screenshot({ path: `${OUT}/recut_moved.png` });
  results.recut = { objectsAfterCut: afterCut, afterSecondTap: re };
  results.logs = logs.slice(-40);
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await b.close();
})();
