import { createHash } from "node:crypto";
export function decodeProductImage(value) {
  const match =
    typeof value === "string" &&
    value.match(/^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) return null;
  const body = Buffer.from(match[2], "base64");
  if (!body.length) return null;
  return {
    body,
    type: `image/${match[1]}`,
    version: createHash("sha256").update(body).digest("hex").slice(0, 16),
  };
}
export function productImageUrl(product) {
  const image = decodeProductImage(product.image);
  return image ? `/api/images/products/${product.slug}/${image.version}` : "";
}
export function publicProduct(product) {
  return { ...product, image: productImageUrl(product) };
}
export function sendImage(req, res, image, version) {
  res.setHeader("Cache-Control", "no-store");
  if (!image || (version && version !== image.version))
    return res.status(404).json({ error: "Image unavailable." });
  res.setHeader("Content-Type", image.type);
  res.setHeader("ETag", `"${image.version}"`);
  res.setHeader(
    "Cache-Control",
    version
      ? "public, max-age=31536000, immutable"
      : "public, max-age=0, s-maxage=60",
  );
  res.setHeader(
    "Vercel-CDN-Cache-Control",
    version ? "public, s-maxage=86400" : "public, s-maxage=60",
  );
  if (req.headers?.["if-none-match"] === `"${image.version}"`)
    return res.status(304).end();
  if (req.method === "HEAD") return res.status(200).end();
  return res.status(200).send(image.body);
}
