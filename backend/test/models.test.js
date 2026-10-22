import test from "node:test";
import assert from "node:assert/strict";
import Product from "../src/models/Product.js";
import Sale from "../src/models/Sale.js";
test("read models target existing POS collections without automatic database preparation", () => {
  for (const [model, collection] of [
    [Product, "products"],
    [Sale, "sales"],
  ]) {
    assert.equal(model.collection.collectionName, collection);
    assert.equal(model.schema.options.autoCreate, false);
    assert.equal(model.schema.options.autoIndex, false);
    assert.equal(model.schema.indexes().length, 0);
  }
});
