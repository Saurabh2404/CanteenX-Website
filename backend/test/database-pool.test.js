import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
test("concurrent requests and duplicate modules share one connection attempt", async () => {
  const originalConnect = mongoose.connect,
    originalUri = process.env.MONGO_URI;
  globalThis.__canteenWebsiteMongo = { promise: null, retryAfter: 0 };
  process.env.MONGO_URI = "mongodb://example.invalid/test";
  let calls = 0;
  mongoose.connect = async () => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return mongoose;
  };
  try {
    const a = await import("../src/config/database.js?pool-test-a");
    const b = await import("../src/config/database.js?pool-test-b");
    await Promise.all([
      a.connectDatabase(),
      b.connectDatabase(),
      a.connectDatabase(),
      b.connectDatabase(),
    ]);
    assert.equal(calls, 1);
    // A rejected handshake must not permanently poison the singleton.
    globalThis.__canteenWebsiteMongo.promise = null;
    mongoose.connect = async () => {
      calls++;
      if (calls === 2) throw Error("test handshake failure");
      return mongoose;
    };
    await assert.rejects(a.connectDatabase());
    await assert.rejects(b.connectDatabase(), {
      name: "DatabaseCooldownError",
    });
    assert.equal(calls, 2);
    globalThis.__canteenWebsiteMongo.retryAfter = 0;
    await b.connectDatabase();
    assert.equal(calls, 3);
  } finally {
    mongoose.connect = originalConnect;
    if (originalUri === undefined) delete process.env.MONGO_URI;
    else process.env.MONGO_URI = originalUri;
    delete globalThis.__canteenWebsiteMongo;
  }
});
