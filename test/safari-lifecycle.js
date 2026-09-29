const SAFARI_CONNECTION_TIMEOUT = 'The session timed out while connecting to a Safari instance';

export async function safariLifecycle(manager, base, ok, skip) {
  let connected = false;
  try {
    const sf = await manager.create({ engine: 'safari' });
    connected = true;
    const nav = await manager.navigate(sf, base);
    const snap = await manager.snapshot(sf);
    const ev = await manager.evaluate(sf, '6*7');
    const sf2 = await manager.create({ engine: 'safari' });
    ok('safari: navigate', nav.title === 'ABM Fixture', nav.title);
    ok('safari: snapshot els', snap.elements.length >= 3, `${snap.elements.length}`);
    ok('safari: evaluate 6*7', ev === 42, String(ev));
    ok('safari: single-session reuse', sf2 === sf, `${sf} vs ${sf2}`);
    await manager.close(sf);
  } catch (error) {
    const reason = error?.message ?? String(error);
    if (!connected && reason.includes(SAFARI_CONNECTION_TIMEOUT)) {
      skip(`SKIP  safari: environment unavailable (real Safari.app session could not connect)  — ${reason}`);
    } else {
      ok('safari: lifecycle', false, reason);
    }
  }
}
