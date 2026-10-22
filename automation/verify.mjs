import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
const frontend = process.env.VERIFY_FRONTEND_URL || "http://localhost:3001";
const backend = process.env.VERIFY_BACKEND_URL || "http://127.0.0.1:5001";
const checks = [];
async function check(name, run) {
  try {
    await run();
    checks.push({ name, status: "passed" });
  } catch (error) {
    checks.push({ name, status: "failed", message: error.message });
  }
}
await check("Separate backend health", async () =>
  assert.equal((await fetch(`${backend}/api/health`)).status, 200),
);
await check("Pages Router renders home", async () => {
  const r = await fetch(frontend);
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(html.includes("__NEXT_DATA__"));
  assert.ok(html.includes("73559"));
});
await check(
  "Eligible products are sold, >=10% discount, ranked by sales",
  async () => {
    const r = await fetch(`${frontend}/api/products`);
    assert.equal(r.status, 200);
    const d = await r.json();
    assert.ok(d.products.length);
    for (const p of d.products) {
      assert.ok(p.discount + 1e-9 >= 10);
      assert.ok(p.popularityRank > 0);
      assert.ok(!("landing" in p));
    }
    for (let i = 1; i < d.products.length; i++)
      assert.ok(
        d.products[i - 1].popularityRank <= d.products[i].popularityRank,
      );
    const p = d.products.find((p) => p.image);
    if (p) {
      const img = await fetch(`${frontend}${p.image}`);
      assert.equal(img.status, 200);
      assert.equal(img.headers.get("cache-control"), "no-store");
    }
  },
);
await check("Only live image sources reach homepage", async () => {
  const d = await (await fetch(`${frontend}/api/home`)).json();
  assert.ok(d.heroProducts.length);
  for (const p of [...d.heroProducts, ...d.categoryProducts])
    assert.ok(p.image.startsWith("/api/products/"));
});
await check("Writes rejected", async () =>
  assert.equal(
    (await fetch(`${backend}/api/products`, { method: "POST" })).status,
    405,
  ),
);
await check("No stored review fallback", async () => {
  const d = await (await fetch(`${frontend}/api/reviews`)).json();
  assert.ok(["ready", "not-configured", "unavailable"].includes(d.status));
  assert.ok(d.source !== "verified-snapshot");
});
const report = { checkedAt: new Date().toISOString(), checks };
const path = fileURLToPath(
  new URL("../reports/verification-latest.json", import.meta.url),
);
await fs.writeFile(path, JSON.stringify(report, null, 2) + "\n");
for (const c of checks)
  console.log(
    `${c.status.toUpperCase()}: ${c.name}${c.message ? " — " + c.message : ""}`,
  );
if (checks.some((c) => c.status === "failed")) process.exitCode = 1;
