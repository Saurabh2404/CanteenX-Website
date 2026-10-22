import assert from "node:assert/strict";
import test from "node:test";
import { handler } from "../src/index.js";
function response() {
  return {
    headers: {},
    code: 200,
    body: undefined,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}
test("native Next.js API rejects all write methods before service access", async () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    const res = response();
    await handler({ method, query: { path: ["products"] } }, res);
    assert.equal(res.code, 405);
    assert.equal(res.headers.Allow, "GET, HEAD, OPTIONS");
    assert.match(res.body.error, /read-only/);
  }
});
test("health uses native JSON response with no-store caching", async () => {
  const res = response();
  await handler({ method: "GET", query: { path: ["health"] } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.status, "ok");
  assert.equal(res.headers["Cache-Control"], "no-store");
});
test("OPTIONS terminates without querying the database", async () => {
  const res = response();
  await handler({ method: "OPTIONS", query: { path: ["products"] } }, res);
  assert.equal(res.code, 204);
  assert.equal(res.ended, true);
});
test("unknown paths and malformed image identifiers return 404", async () => {
  for (const path of [["unknown"], ["products", "invalid", "image"]]) {
    const res = response();
    await handler({ method: "GET", query: { path } }, res);
    assert.equal(res.code, 404);
  }
});
