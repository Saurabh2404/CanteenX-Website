import { sendImage } from "./utils/images.js";
import { getHeroImage } from "./services/heroService.js";
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
    if (path === "/home" || path === "/products") {
      const data = await getPageData(path);
      res.setHeader(
        "Cache-Control",
        "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      );
      return res.status(200).json(data);
    }
    const hero = path.match(/^\/images\/hero\/([a-f\d]{16,64})$/i);
    if (hero || path === "/hero/image") {
      const version =
        hero?.[1] ||
        (typeof req.query.v === "string" ? req.query.v : undefined);
      return sendImage(req, res, await getHeroImage(version), version);
    }
    const match = path.match(
      /^\/images\/products\/(\d+|[a-f\d]{24})\/([a-f\d]{16})$/i,
    );
    const legacy = path.match(/^\/products\/(\d+|[a-f\d]{24})\/image$/i);
    if (match || legacy) {
      const slug = (match || legacy)[1];
      const version =
        match?.[2] ||
        (typeof req.query.v === "string" ? req.query.v : undefined);
      return sendImage(req, res, await getProductImage(slug, version), version);
    }
    return res.status(404).json({ error: "Not found." });
  } catch (error) {
    // Log diagnostic codes only; never log messages, URIs or provider payloads.
    console.error("Website API unavailable", {
      name: error?.name,
      code: error?.code,
      databaseConfigured: Boolean(process.env.MONGO_URI),
    });
    return res
      .status(503)
      .json({ error: "The requested information is temporarily unavailable." });
  }
}
