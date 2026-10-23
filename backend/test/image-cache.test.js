import test from "node:test";
import assert from "node:assert/strict";
import { createSnapshotCache } from "../src/utils/snapshotCache.js";
import {
  decodeProductImage,
  publicProduct,
  sendImage,
} from "../src/utils/images.js";
const image = "data:image/png;base64,iVBORw0KGgo=";
function response() {
  return {
    headers: {},
    code: 200,
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(v) {
      this.code = v;
      return this;
    },
    json(v) {
      this.body = v;
      return this;
    },
    send(v) {
      this.body = v;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}
test("cold concurrent readers share one snapshot; refreshed versions retain the preceding snapshot", async () => {
  let calls = 0,
    now = 0;
  const cache = createSnapshotCache(
    async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 5));
      return { version: calls };
    },
    { ttl: 60, staleTtl: 600, now: () => now },
  );
  const results = await Promise.all(
    Array.from({ length: 32 }, () => cache.get()),
  );
  assert.equal(calls, 1);
  assert.ok(results.every((r) => r.version === 1));
  now = 61;
  assert.equal((await cache.get()).version, 2);
  assert.equal(cache.previous().version, 1);
  assert.equal((await cache.get()).version, 2);
  assert.equal(calls, 2);
});
test("failed snapshot refresh preserves old image data but refuses stale catalogue publication and backs off", async () => {
  let now = 0,
    fail = false,
    calls = 0;
  const cache = createSnapshotCache(
    async () => {
      calls++;
      if (fail) throw Error("offline");
      return "last good";
    },
    { ttl: 60, staleTtl: 600, now: () => now },
  );
  await cache.get();
  fail = true;
  now = 61;
  await assert.rejects(cache.get());
  assert.equal(await cache.get({ allowStale: true }), "last good");
  assert.equal(calls, 2);
  now = 700;
  await assert.rejects(cache.get({ allowStale: true }));
});
test("public image references are hashed URLs and change when encoded bytes change", () => {
  const product = { slug: "42", image, name: "Example" };
  const a = publicProduct(product);
  assert.match(a.image, /^\/api\/images\/products\/42\/[a-f0-9]{16}$/);
  assert.ok(!JSON.stringify(a).includes("base64"));
  assert.notEqual(
    a.image,
    publicProduct({ ...product, image: "data:image/png;base64,Y2hhbmdlZA==" })
      .image,
  );
  assert.equal(publicProduct({ ...product, image: "not an image" }).image, "");
});
test("versioned image responses cache only successful matching bytes; missing/version errors remain uncached", () => {
  const decoded = decodeProductImage(image);
  for (const [candidate, version] of [
    [null, decoded.version],
    [decoded, "0000000000000000"],
  ]) {
    const res = response();
    sendImage({ method: "GET" }, res, candidate, version);
    assert.equal(res.code, 404);
    assert.equal(res.headers["Cache-Control"], "no-store");
    assert.equal(res.headers["Vercel-CDN-Cache-Control"], undefined);
  }
  const res = response();
  sendImage({ method: "GET" }, res, decoded, decoded.version);
  assert.equal(res.code, 200);
  assert.equal(res.headers["Content-Type"], "image/png");
  assert.match(res.headers["Cache-Control"], /immutable/);
  assert.match(res.headers["Vercel-CDN-Cache-Control"], /86400/);
  assert.deepEqual(res.body, decoded.body);
  const cached = response();
  sendImage(
    { method: "GET", headers: { "if-none-match": `"${decoded.version}"` } },
    cached,
    decoded,
    decoded.version,
  );
  assert.equal(cached.code, 304);
  const head = response();
  sendImage({ method: "HEAD" }, head, decoded, decoded.version);
  assert.equal(head.code, 200);
  assert.equal(head.body, undefined);
});
