import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

const cliUrl = new URL('../bin/git-mind.js', import.meta.url);

async function loadFlushStream() {
  const source = await readFile(cliUrl, 'utf8');
  const start = source.indexOf('async function flushStream');
  const endMarker = '\n}\n\nawait flushStream(process.stdout);';
  const end = source.indexOf(endMarker, start) + 3;

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(3);

  const fnSource = source.slice(start, end);
  return Function(`${fnSource}; return flushStream;`)();
}

function streamError(code) {
  const err = Object.assign(new Error(code), { code });
  return {
    writable: true,
    destroyed: false,
    write(_chunk, callback) {
      callback(err);
    },
  };
}

describe('CLI stream flushing', () => {
  it('ignores broken pipe flush errors during shutdown', async () => {
    const flushStream = await loadFlushStream();

    await expect(flushStream(streamError('EPIPE'))).resolves.toBeUndefined();
    await expect(flushStream(streamError('ERR_STREAM_DESTROYED'))).resolves.toBeUndefined();
  });

  it('still rejects unexpected flush errors', async () => {
    const flushStream = await loadFlushStream();

    await expect(flushStream(streamError('EIO'))).rejects.toMatchObject({ code: 'EIO' });
  });
});
