import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
const frontend = process.env.VERIFY_FRONTEND_URL || "http://localhost:3001";
const checks = [],
  measurements = {};
const execute = promisify(execFile);
async function request(path, options = {}) {
  const deployment = process.env.VERIFY_VERCEL_DEPLOYMENT;
  if (!deployment)
    return fetch(new URL(path, frontend), {
      signal: AbortSignal.timeout(30000),
      ...options,
    });
  const directory = await fs.mkdtemp(join(tmpdir(), "canteen-preview-check-"));
  try {
    const headersPath = join(directory, "headers"),
      bodyPath = join(directory, "body");
    const args = [
      "curl",
      path,
      "--deployment",
      deployment,
      "--scope",
      "saurabh2404s-projects",
      "--",
      "--silent",
      "--show-error",
      "--max-time",
      "30",
      "--dump-header",
      headersPath,
      "--output",
      bodyPath,
      "--write-out",
      "%{http_code}",
    ];
    if (options.method) args.push("--request", options.method);
    const { stdout } = await execute("vercel", args, {
      timeout: 45000,
      maxBuffer: 1024 * 1024,
    });
    const status = Number(stdout.trim());
    const raw = await fs.readFile(headersPath, "utf8");
    const headers = new Headers();
    for (const line of raw.trim().split(/\r?\n/)) {
      const index = line.indexOf(":");
      if (index > 0)
        headers.set(line.slice(0, index), line.slice(index + 1).trim());
    }
    const body = await fs.readFile(bodyPath);
    return new Response([204, 304].includes(status) ? null : body, {
      status,
      headers,
    });
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}
async function check(name, run) {
  try {
    await run();
    checks.push({ name, status: "passed" });
  } catch (error) {
    checks.push({ name, status: "failed", message: error.message });
  }
}
async function page(path) {
  const r = await request(path);
  assert.equal(r.status, 200);
  const html = await r.text();
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  assert.ok(match);
  assert.ok(
    !html.includes("data:image/"),
    "Image bodies must not be serialized into HTML",
  );
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
  for (const img of html.matchAll(/<img\b[^>]*>/g))
    assert.match(img[0], /\balt="[^"]*"/);
  for (const schema of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs,
  ))
    JSON.parse(schema[1]);
  const title = html.match(/<title[^>]*>(.*?)<\/title>/)?.[1];
  const canonical = html.match(
    /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/,
  )?.[1];
  const props = JSON.parse(match[1]).props.pageProps;
  measurements[path] = {
    htmlBytes: Buffer.byteLength(html),
    pagePropsBytes: Buffer.byteLength(JSON.stringify(props)),
    title,
    canonical,
  };
  return { html, props, title, canonical };
}
let home, catalogue, product;
await check("Next.js API health", async () =>
  assert.equal((await request("/api/health")).status, 200),
);
await check(
  "Homepage is under 250 KB, with URL images, business and FAQ schema",
  async () => {
    home = await page("/");
    assert.ok(measurements["/"].htmlBytes < 250000);
    assert.match(
      home.props.heroImage.url,
      /^\/api\/images\/hero\/[a-f0-9]{16,64}$/,
    );
    for (const p of home.props.categoryProducts)
      assert.match(p.image, /^\/api\/images\/products\//);
    assert.ok(
      home.html.includes("GroceryStore") && home.html.includes("FAQPage"),
    );
    assert.ok(
      !home.html.includes("/products?category=") &&
        !home.html.includes("/products?q="),
    );
    assert.match(home.html, /<h1[^>]*>Ardh Sainik Canteen Kanti/);
  },
);
await check(
  "Catalogue keeps sold products with at least 10% off, and canonicalizes search",
  async () => {
    catalogue = await page("/products");
    assert.ok(catalogue.props.products.length);
    let rank = 0;
    for (const p of catalogue.props.products) {
      assert.ok(p.discount + 1e-9 >= 10);
      assert.ok(p.popularityRank >= rank && p.popularityRank > 0);
      rank = p.popularityRank;
      if (p.image) assert.match(p.image, /^\/api\/images\/products\//);
    }
    const search = await page("/products?q=tea");
    assert.ok(search.canonical?.endsWith("/products"));
    product = catalogue.props.products.find((p) => p.image);
    assert.ok(product);
  },
);
await check(
  "Category and product pages have unique metadata and matching breadcrumbs",
  async () => {
    assert.ok(product);
    const category = await page(`/products/category/${product.category}`);
    assert.ok(
      category.props.products.every((p) => p.category === product.category),
    );
    const item = await page(`/products/item/${product.slug}`);
    assert.equal(item.props.product.slug, product.slug);
    assert.ok(
      item.html.includes("BreadcrumbList") &&
        category.html.includes("BreadcrumbList"),
    );
    assert.ok(
      category.canonical?.endsWith(`/products/category/${product.category}`),
    );
    assert.ok(item.canonical?.endsWith(`/products/item/${product.slug}`));
    assert.equal(
      new Set([home.title, catalogue.title, category.title, item.title]).size,
      4,
    );
  },
);
await check(
  "Legacy category redirects permanently and invalid routes return 404",
  async () => {
    const r = await request("/products?category=food", { redirect: "manual" });
    assert.equal(r.status, 308);
    const location = new URL(r.headers.get("location"), frontend);
    assert.equal(location.pathname, "/products/category/food");
    assert.ok(!location.searchParams.has("category"));
    for (const path of [
      "/products/category/unknown-category",
      "/products/item/invalid",
      "/products/item/999999999999",
    ])
      assert.equal((await request(path)).status, 404);
  },
);
await check(
  "Hero and product images load, support ETags, and immutable cache headers",
  async () => {
    for (const path of [home.props.heroImage.url, product.image]) {
      const r = await request(path);
      assert.equal(r.status, 200);
      assert.match(r.headers.get("content-type"), /^image\//);
      assert.match(r.headers.get("cache-control"), /immutable/);
      assert.ok((await r.arrayBuffer()).byteLength > 0);
      const hit = await request(path);
      assert.equal(hit.status, 200);
      assert.equal(hit.headers.get("etag"), r.headers.get("etag"));
      measurements[path] = {
        cdnCache: hit.headers.get("x-vercel-cache"),
        cacheControl: hit.headers.get("cache-control"),
      };
    }
    const bad = await request(
      product.image.replace(/[a-f0-9]{16}$/, "0000000000000000"),
    );
    assert.equal(bad.status, 404);
    assert.match(bad.headers.get("cache-control"), /no-store/);
  },
);
await check("Robots and sitemap match launch settings", async () => {
  const robots = await (await request("/robots.txt")).text();
  const sitemap = await request("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.headers.get("content-type"), /xml/);
  const xml = await sitemap.text();
  assert.ok(
    xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'),
  );
  if (home.html.includes('content="index,follow"')) {
    assert.match(robots, /Allow: \//);
    assert.ok(
      xml.includes(`/products/category/${product.category}`) &&
        xml.includes(`/products/item/${product.slug}`),
    );
  } else {
    assert.match(robots, /Disallow: \//);
    assert.ok(!xml.includes("<loc>"));
  }
  assert.ok(!xml.includes("?q=") && !xml.includes("?category="));
});
await check("Writes rejected before database access", async () =>
  assert.equal(
    (await request("/api/products", { method: "POST" })).status,
    405,
  ),
);
await check("No stored or invented Google reviews", async () => {
  const d = await (await request("/api/reviews")).json();
  assert.ok(["ready", "not-configured", "unavailable"].includes(d.status));
  assert.ok(d.source !== "verified-snapshot");
});
await fs.mkdir(fileURLToPath(new URL("../reports/", import.meta.url)), {
  recursive: true,
});
await fs.writeFile(
  fileURLToPath(
    new URL("../reports/verification-latest.json", import.meta.url),
  ),
  JSON.stringify(
    { checkedAt: new Date().toISOString(), checks, measurements },
    null,
    2,
  ) + "\n",
);
for (const c of checks)
  console.log(
    `${c.status.toUpperCase()}: ${c.name}${c.message ? " — " + c.message : ""}`,
  );
console.log(
  "Page sizes:",
  JSON.stringify(
    Object.fromEntries(
      Object.entries(measurements).filter(([, v]) => v.htmlBytes),
    ),
  ),
);
if (checks.some((c) => c.status === "failed")) process.exitCode = 1;
