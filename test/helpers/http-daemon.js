// Shared HTTP-daemon fixture for HTTP-level tests. Spawns the real daemon
// entrypoint as an owned subprocess on an OS-assigned loopback port (port0),
// auto-attach disabled, with readiness timeout and cleanup preserved from the
// original test/extensive.js implementation.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function startHttpDaemon(entryOverride) {
  const entry = entryOverride || fileURLToPath(new URL('../../src/index.js', import.meta.url));
  return new Promise((resolve, reject) => {
    let stderr = '';
    let settled = false;
    const child = spawn(process.execPath, [entry], {
      env: {
        ...process.env,
        APEX_BROWSER_TRANSPORT: 'http',
        APEX_BROWSER_PORT: '0',
        APEX_BROWSER_AUTOATTACH: '0',
        APEX_BROWSER_HEADLESS: '1',
        APEX_BROWSER_MAX_SESSIONS: '30',
      },
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    const fail = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill('SIGTERM');
      reject(error);
    };
    const timer = setTimeout(() => fail(new Error(`HTTP daemon startup timed out: ${stderr.trim()}`)), 10000);
    child.once('error', fail);
    child.once('exit', (code, signal) => {
      if (!settled) fail(new Error(`HTTP daemon exited before ready (${code ?? signal}): ${stderr.trim()}`));
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr = (stderr + chunk).slice(-4096);
      const match = stderr.match(/http daemon on 127\.0\.0\.1:(\d+)/);
      if (settled || !match) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        child,
        url: `http://127.0.0.1:${match[1]}/mcp`,
        async stop() {
          if (child.exitCode !== null || child.signalCode !== null) return;
          const exited = new Promise((done) => child.once('exit', done));
          child.kill('SIGTERM');
          const forceStop = setTimeout(() => child.kill('SIGKILL'), 5000);
          await exited;
          clearTimeout(forceStop);
        },
      });
    });
  });
}
