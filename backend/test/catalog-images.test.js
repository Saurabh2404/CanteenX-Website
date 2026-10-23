import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import Sale from "../src/models/Sale.js";
test("catalogue and 24 concurrent image requests share a single read; updated image bytes change the public URL", async () => {
  const original = {
    connect: mongoose.connect,
    find: Product.find,
    aggregate: Sale.aggregate,
    now: Date.now,
    uri: process.env.MONGO_URI,
  };
  let clock = 100000,
    reads = 0,
    connections = 0,
    sales = 0,
    image = "data:image/png;base64,iVBORw0KGgo=";
  Date.now = () => clock;
  process.env.MONGO_URI = "mongodb://example.invalid/test";
  delete globalThis.__canteenWebsiteCatalog;
  globalThis.__canteenWebsiteMongo = { promise: null, retryAfter: 0 };
  mongoose.connect = async (_uri, options) => {
    connections++;
    assert.equal(options.maxPoolSize, 1);
    assert.equal(options.autoCreate, false);
    assert.equal(options.autoIndex, false);
    return mongoose;
  };
  Product.find = () => {
    reads++;
    return {
      select() {
        return this;
      },
      lean() {
        return this;
      },
      async maxTimeMS() {
        await new Promise((r) => setTimeout(r, 5));
        return [
          {
            _id: "abc",
            productId: 42,
            name: "Tea",
            selling: 80,
            mrp: 100,
            image,
          },
        ];
      },
    };
  };
  Sale.aggregate = () => ({
    async option() {
      sales++;
      return [{ _id: "abc", units: 5, frequency: 2 }];
    },
  });
  try {
    const service =
      await import("../src/services/catalogService.js?image-service-test");
    const images = await Promise.all(
      Array.from({ length: 24 }, () => service.getProductImage("42")),
    );
    assert.equal(reads, 1);
    assert.equal(sales, 1);
    assert.equal(connections, 1);
    assert.ok(images.every((i) => i.type === "image/png"));
    const before = (await service.getPublicCatalog()).products[0];
    assert.match(before.image, /\/api\/images\/products\/42\//);
    assert.ok(!JSON.stringify(before).includes("base64"));
    assert.equal(reads, 1);
    assert.equal(await service.getProductImage("42", "0000000000000000"), null);
    assert.equal(await service.getProductImage("999"), null);
    assert.equal(reads, 1);
    clock += 60001;
    image = "data:image/png;base64,Y2hhbmdlZA==";
    const after = (await service.getPublicCatalog()).products[0];
    assert.notEqual(after.image, before.image);
    assert.equal(reads, 2);
    assert.equal(
      (await service.getProductImage("42", images[0].version)).version,
      images[0].version,
    );
  } finally {
    mongoose.connect = original.connect;
    Product.find = original.find;
    Sale.aggregate = original.aggregate;
    Date.now = original.now;
    if (original.uri === undefined) delete process.env.MONGO_URI;
    else process.env.MONGO_URI = original.uri;
    delete globalThis.__canteenWebsiteCatalog;
    delete globalThis.__canteenWebsiteMongo;
  }
});
