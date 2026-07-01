import { BrowserManager } from '../src/manager.js';
const m = new BrowserManager({ headless: true });
let rc = 0;
try {
  const wk = await m.create({ engine: 'webkit' });
  const sf = await m.create({ engine: 'safari' });
  const wkNav = await m.navigate(wk, 'https://example.com/');
  const sfNav = await m.navigate(sf, 'https://example.com/');
  const sfSnap = await m.snapshot(sf);
  const shot = await m.screenshot(sf, '/tmp/abm-safari.png');
  console.log('webkit  :', wk, wkNav.title);
  console.log('safari  :', sf, sfNav.title, 'interactive=' + sfSnap.elements.length, 'shot=' + shot.path);
  console.log('list    :', JSON.stringify(m.list()));
  const sf2 = await m.create({ engine: 'safari' });
  console.log('reuse   :', sf2 === sf ? 'PASS (single-session reused)' : 'FAIL got ' + sf2);
  if (!sfNav.title.includes('Example')) rc = 1;
  if (sf2 !== sf) rc = 1;
} catch (e) { console.log('FAIL', e.message); rc = 1; }
finally { await m.shutdown(); process.exit(rc); }
