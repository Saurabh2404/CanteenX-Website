import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
const frontend = process.env.VERIFY_FRONTEND_URL || "http://localhost:3001";
const checks = [];
async function check(name, run) {
  try {
    await run();
    checks.push({ name, status: "passed" });
  } catch (error) {
    checks.push({ name, status: "failed", message: error.message });
  }
}
async function page(path) {
  const r = await fetch(frontend + path);
  assert.equal(r.status, 200);
  const html = await r.text();
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  assert.ok(match);
  return { html, props: JSON.parse(match[1]).props.pageProps };
}
await check("Next.js API health", async () =>
  assert.equal((await fetch(frontend + "/api/health")).status, 200),
);
await check(
  "Cached homepage embeds one database hero and category photos",
  async () => {
    const { html, props } = await page("/");
    assert.ok(html.includes("73559"));
    assert.match(props.heroImage.url, /^data:image\/webp;base64,/);
    for (const p of props.categoryProducts)
      assert.match(p.image, /^data:image\//);
    assert.ok(!html.includes('src="/api/products/'));
    assert.ok(!html.includes('src="/api/hero/'));
    const image = await fetch(props.heroImage.url);
    assert.equal(image.headers.get("content-type"), "image/webp");
  },
);
await check(
  "Cached catalogue keeps sold products with at least 10% discount",
  async () => {
    const { html, props } = await page("/products");
    assert.ok(props.products.length);
    let previous = 0;
    for (const p of props.products) {
      assert.ok(p.discount + 1e-9 >= 10);
      assert.ok(p.popularityRank >= previous && p.popularityRank > 0);
      previous = p.popularityRank;
      assert.ok(!("landing" in p));
      if (p.image) assert.match(p.image, /^data:image\//);
    }
    assert.ok(!html.includes('src="/api/products/'));
  },
);
await check("Writes rejected without database access", async () =>
  assert.equal(
    (await fetch(frontend + "/api/products", { method: "POST" })).status,
    405,
  ),
);
await check("No stored Google review fallback", async () => {
  const d = await (await fetch(frontend + "/api/reviews")).json();
  assert.ok(["ready", "not-configured", "unavailable"].includes(d.status));
  assert.ok(d.source !== "verified-snapshot");
});
await fs.writeFile(
  fileURLToPath(
    new URL("../reports/verification-latest.json", import.meta.url),
  ),
  JSON.stringify({ checkedAt: new Date().toISOString(), checks }, null, 2) +
    "\n",
);
for (const c of checks)
  console.log(
    `${c.status.toUpperCase()}: ${c.name}${c.message ? " — " + c.message : ""}`,
  );
if (checks.some((c) => c.status === "failed")) process.exitCode = 1;
