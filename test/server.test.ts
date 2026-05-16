import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { resolve } from '../src/server.js';

// These tests are integration tests that require live DNS. They use well-known
// stable hostnames (cloudflare DNS resolver and example.com).

test('A record for one.one.one.one resolves to 1.1.1.1', async () => {
  const r = (await resolve('one.one.one.one', 'A')) as string[];
  assert.ok(Array.isArray(r));
  assert.ok(r.includes('1.1.1.1') || r.includes('1.0.0.1'));
});

test('A record for example.com resolves to at least one IP', async () => {
  const r = (await resolve('example.com', 'A')) as string[];
  assert.ok(Array.isArray(r));
  assert.ok(r.length > 0);
});

test('NS records for example.com return a list', async () => {
  const r = (await resolve('example.com', 'NS')) as string[];
  assert.ok(Array.isArray(r));
  assert.ok(r.length > 0);
});

test('rejects unsupported type', async () => {
  // @ts-expect-error intentionally wrong type
  await assert.rejects(() => resolve('example.com', 'BOGUS'));
});

test('rejects bad hostname', async () => {
  await assert.rejects(() => resolve('this-host-should-not-exist-12345.invalid'));
});
