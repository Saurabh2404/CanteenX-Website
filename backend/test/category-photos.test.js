import test from "node:test";
import assert from "node:assert/strict";
import { uniqueCategoryPhotos } from "../src/utils/images.js";

test("category previews replace duplicate image bytes across SKUs and categories", () => {
  const photo = (slug, category, bytes) => ({
    slug,
    category,
    image: `data:image/png;base64,${bytes}`,
  });
  const products = [
    photo("1", "food", "aW1hZ2U="),
    photo("2", "food", "aW1h Z2U="),
    photo("3", "daily-items", "aW1hZ2U="),
    photo("4", "daily-items", "bad!"),
    photo("5", "daily-items", "ZGlmZmVyZW50"),
    photo("6", "food", "YW5vdGhlcg=="),
  ];
  const selected = uniqueCategoryPhotos(products);
  assert.deepEqual(
    selected.map((p) => p.slug),
    ["1", "5", "6"],
  );
  assert.ok(selected.every((p) => p.image.startsWith("/api/images/products/")));
  assert.ok(products.every((p) => p.image.startsWith("data:")));
});
