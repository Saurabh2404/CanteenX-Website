import test from "node:test";
import assert from "node:assert/strict";
import { getGoogleReviews } from "../src/services/reviewService.js";
const savedFetch = globalThis.fetch;
const savedKey = process.env.GOOGLE_PLACES_API_KEY;
const savedPlace = process.env.GOOGLE_PLACE_ID;
test.after(() => {
  globalThis.fetch = savedFetch;
  for (const [k, v] of [
    ["GOOGLE_PLACES_API_KEY", savedKey],
    ["GOOGLE_PLACE_ID", savedPlace],
  ]) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});
test("does not invent or load a stored review fallback without API credentials", async () => {
  delete process.env.GOOGLE_PLACES_API_KEY;
  delete process.env.GOOGLE_PLACE_ID;
  globalThis.fetch = () => {
    throw Error("Unexpected fetch");
  };
  const result = await getGoogleReviews();
  assert.equal(result.status, "not-configured");
  assert.equal(result.reviews.length, 0);
});
test("rejects another branch before publishing reviews", async () => {
  process.env.GOOGLE_PLACES_API_KEY = "test-only";
  process.env.GOOGLE_PLACE_ID = "test-place";
  globalThis.fetch = async () =>
    Response.json({
      displayName: { text: "Ardh Sainik Canteen" },
      formattedAddress: "Delhi",
      reviews: [{ text: { text: "test fixture" } }],
    });
  assert.equal((await getGoogleReviews()).status, "unavailable");
});
test("preserves attribution and mixed ratings without exposing credentials", async () => {
  let options;
  globalThis.fetch = async (_url, init) => {
    options = init;
    return Response.json({
      displayName: { text: "Ardh Sainik Canteen" },
      formattedAddress: "Station Road, Kanti, Bihar",
      rating: 4.2,
      userRatingCount: 10,
      googleMapsUri: "https://maps.google.com/?cid=test",
      reviews: [
        {
          name: "test-review",
          rating: 2,
          originalText: { text: "Test fixture, not a customer review." },
          authorAttribution: {
            displayName: "Test Author",
            uri: "https://maps.google.com/test",
            photoUri: "javascript:bad",
          },
          googleMapsUri: "https://maps.google.com/test-review",
        },
      ],
    });
  };
  const result = await getGoogleReviews();
  assert.equal(result.status, "ready");
  assert.equal(result.reviews[0].rating, 2);
  assert.equal(result.reviews[0].author, "Test Author");
  assert.equal(result.reviews[0].photo, "");
  assert.equal(options.cache, "no-store");
  assert.ok(!JSON.stringify(result).includes("test-only"));
});
test("provider errors yield unavailable without raw errors or fabricated reviews", async () => {
  globalThis.fetch = async () => new Response("secret error", { status: 403 });
  const result = await getGoogleReviews();
  assert.equal(result.status, "unavailable");
  assert.equal(result.reviews.length, 0);
  assert.ok(!JSON.stringify(result).includes("secret"));
});
