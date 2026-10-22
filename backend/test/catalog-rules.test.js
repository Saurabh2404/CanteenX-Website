import assert from "node:assert/strict";
import test from "node:test";
import { classifyProduct, discount } from "../src/utils/catalogRules.js";
test("discount reflects savings and rejects invalid MRP", () => {
  assert.equal(discount(70, 250), 72);
  assert.equal(discount(0, 0), 0);
  assert.equal(discount(120, 100), 0);
  assert.equal(discount(-1, 100), 0);
});
test("distinct food, beverages, cleaning and cookware categories", () => {
  for (const [name, category] of [
    ["Tata Tea Gold (500gm)", "beverages"],
    ["Comfort Fabric Conditioner 210ml", "cleaning"],
    ["Moong Dal 1Kg", "cooking-foods"],
    ["Milton Steel Lunch Box", "cooking-items"],
    ["Colgate toothpaste", "personal-care"],
    ["Parle biscuit", "food"],
    ["Unspecified item", "daily-items"],
  ])
    assert.equal(classifyProduct(name), category, name);
});

import { discountedBestSellers } from "../src/utils/catalogRules.js";
test("only sold products at or above 10% off appear, in sales order rather than discount order", () => {
  const rows = [
    { name: "Big discount", price: 50, mrp: 100, popularityRank: 3 },
    { name: "Boundary", price: 90, mrp: 100, popularityRank: 1 },
    { name: "Below threshold", price: 90.01, mrp: 100, popularityRank: 2 },
    { name: "Unsold", price: 50, mrp: 100, popularityRank: 0 },
    { name: "Decimal boundary", price: 4.5, mrp: 5, popularityRank: 4 },
    { name: "Invalid MRP", price: 0, mrp: 0, popularityRank: 5 },
  ];
  assert.deepEqual(
    discountedBestSellers(rows).map((p) => p.name),
    ["Boundary", "Big discount", "Decimal boundary"],
  );
  assert.equal(rows[0].name, "Big discount");
});

test("preview categories distinguish laundry and skin care from food", () => {
  assert.equal(classifyProduct("SURF EXCEL SOAP"), "cleaning");
  assert.equal(classifyProduct("JOY Honey& Almonds 300ml"), "personal-care");
  assert.equal(classifyProduct("Pansari Sooji 500gm"), "cooking-foods");
  assert.equal(classifyProduct("Junto Mixer Grinder"), "cooking-items");
});
