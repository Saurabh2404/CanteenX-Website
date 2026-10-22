import {
  getPublicCatalog,
  getHomeData,
  getProductImage,
} from "./services/catalogService.js";
import { getGoogleReviews } from "./services/reviewService.js";

// Server-rendered pages call services directly, avoiding a self-HTTP request.
export async function getPageData(path) {
  if (path === "/home") return getHomeData();
  if (path === "/products") return getPublicCatalog();
  throw new Error("Unknown page data request");
}
export function applyReadOnly(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method || "GET")) {
    res.setHeader("Allow", "GET, HEAD, OPTIONS");
    res.status(405).json({ error: "This website API is read-only." });
    return false;
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, HEAD, OPTIONS");
    res.status(204).end();
    return false;
  }
  return true;
}
export async function handler(req, res) {
  if (!applyReadOnly(req, res)) return;
  const parts = req.query.path || [];
  const path = "/" + (Array.isArray(parts) ? parts.join("/") : parts);
  try {
    if (path === "/health")
      return res
        .status(200)
        .json({ status: "ok", service: "canteenx-website-nextjs" });
    if (path === "/reviews")
      return res.status(200).json(await getGoogleReviews());
    if (path === "/home" || path === "/products")
      return res.status(200).json(await getPageData(path));
    const match = path.match(/^\/products\/(\d+|[a-f\d]{24})\/image$/i);
    if (match) {
      const image = await getProductImage(match[1]);
      if (!image)
        return res.status(404).json({ error: "Product image unavailable." });
      res.setHeader("Content-Type", image.type);
      return res.status(200).send(image.body);
    }
    return res.status(404).json({ error: "Not found." });
  } catch {
    return res
      .status(503)
      .json({ error: "The requested information is temporarily unavailable." });
  }
}
