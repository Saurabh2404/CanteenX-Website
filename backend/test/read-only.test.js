import assert from "node:assert/strict";
import test from "node:test";
import { readOnly } from "../src/middleware/readOnly.js";
test("write methods are rejected before reaching a controller", () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    let status;
    let passed = false;
    const res = {
      status(code) {
        status = code;
        return this;
      },
      set() {
        return this;
      },
      json(body) {
        assert.match(body.error, /read-only/);
      },
    };
    readOnly({ method }, res, () => {
      passed = true;
    });
    assert.equal(status, 405);
    assert.equal(passed, false);
  }
});
test("read requests proceed with no-store caching", () => {
  let cache;
  let passed = false;
  readOnly(
    { method: "GET" },
    {
      set(key, value) {
        if (key === "Cache-Control") cache = value;
      },
    },
    () => {
      passed = true;
    },
  );
  assert.equal(passed, true);
  assert.equal(cache, "no-store");
});
