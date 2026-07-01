import { BrowserManager } from '../src/manager.js';
const EP = 'http://127.0.0.1:9222';
const m = new BrowserManager({ headless: true });
let rc = 0;
try {
  const def = await m.attach({ cdpEndpoint: EP, mode: 'default' });   // real context
  const iso = await m.attach({ cdpEndpoint: EP, mode: 'isolated' });  // fresh context, same Chrome
  const wk  = await m.create({ engine: 'webkit' });                   // different engine, concurrent

  const dNav = await m.navigate(def.session, 'https://example.com/');
  const iNav = await m.navigate(iso.session, 'https://example.org/');
  const wNav = await m.navigate(wk, 'https://example.com/');
  const iSnap = await m.snapshot(iso.session);
  const wd = await m.evaluate(iso.session, 'navigator.webdriver'); // stealth => undefined

  console.log('default  :', def.session, `"${dNav.title}"`, 'mode=' + def.mode);
  console.log('isolated :', iso.session, `"${iNav.title}"`, 'navigator.webdriver=' + wd, 'interactive=' + iSnap.elements.length);
  console.log('webkit   :', wk, `"${wNav.title}"`, '(concurrent, separate engine)');
  console.log('list     :', JSON.stringify(m.list()));

  await m.close(def.session);   // adopting close must NOT kill Chrome
  await m.close(iso.session);
  const re = await m.attach({ cdpEndpoint: EP, mode: 'default' }); // survives?
  console.log('survive  :', re.session ? 'PASS (Chrome alive after close)' : 'FAIL');
  await m.close(re.session);

  if (!dNav.title.includes('Example')) rc = 1;
  if (wd !== undefined) { console.log('WARN stealth: navigator.webdriver =', wd); }
} catch (e) { console.log('FAIL', e.message); rc = 1; }
finally { await m.shutdown(); process.exit(rc); }
