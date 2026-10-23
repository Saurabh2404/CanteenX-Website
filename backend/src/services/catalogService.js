import { getHeroMetadata } from "./heroService.js";
import { createSnapshotCache } from "../utils/snapshotCache.js";
import { decodeProductImage, publicProduct } from "../utils/images.js";
import { connectDatabase } from "../config/database.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import {
  classifyProduct,
  discount,
  discountedBestSellers,
} from "../utils/catalogRules.js";
let popularity;
async function readCatalog() {
  await connectDatabase();
  const records = await Product.find({})
    .select("_id productId name selling mrp image")
    .lean()
    .maxTimeMS(8000);
  let popularityAvailable = true;
  try {
    if (!popularity || popularity.expires < Date.now()) {
      const rows = await Sale.aggregate([
        { $match: { date: { $gte: new Date(Date.now() - 90 * 86400000) } } },
        { $unwind: "$items" },
        {
          $project: {
            product: "$items.product",
            net: {
              $max: [
                0,
                {
                  $subtract: [
                    "$items.quantity",
                    { $ifNull: ["$items.returned", 0] },
                  ],
                },
              ],
            },
          },
        },
        { $match: { net: { $gt: 0 } } },
        {
          $group: {
            _id: "$product",
            units: { $sum: "$net" },
            frequency: { $sum: 1 },
          },
        },
        { $sort: { units: -1, frequency: -1, _id: 1 } },
      ]).option({ maxTimeMS: 5000 });
      popularity = {
        expires: Date.now() + 60000,
        ranks: new Map(rows.map((r, i) => [String(r._id), i + 1])),
      };
    }
  } catch (error) {
    // Keep the last successful ISR page instead of publishing an empty catalogue.
    throw error;
  }
  const products = records
    .filter(
      (p) =>
        typeof p.name === "string" &&
        Number.isFinite(p.selling) &&
        Number.isFinite(p.mrp),
    )
    .map((p) => ({
      slug: String(p.productId ?? p._id),
      name: p.name,
      category: classifyProduct(p.name),
      unit: "",
      price: p.selling,
      mrp: p.mrp,
      discount: discount(p.selling, p.mrp),
      popularityRank: popularityAvailable
        ? (popularity?.ranks.get(String(p._id)) ?? 0)
        : 0,
      image: typeof p.image === "string" && p.image ? p.image : "",
    }));
  products.sort(
    (a, b) =>
      (a.popularityRank || Infinity) - (b.popularityRank || Infinity) ||
      a.name.localeCompare(b.name),
  );
  return { products, popularityAvailable };
}
// Shared even when Next bundles this service into multiple server modules.
const snapshot = (globalThis.__canteenWebsiteCatalog ??=
  createSnapshotCache(readCatalog));
export async function getCatalog() {
  return snapshot.get();
}
export async function getPublicCatalog() {
  const data = await getCatalog();
  return {
    products: data.popularityAvailable
      ? discountedBestSellers(data.products).map(publicProduct)
      : [],
    popularityAvailable: data.popularityAvailable,
  };
}
export async function getHomeData() {
  const data = await getCatalog();
  const heroImage = await getHeroMetadata();
  const categories = [...new Set(data.products.map((p) => p.category))];
  const categoryProducts = categories.flatMap((category) =>
    data.products
      .filter((p) => p.category === category && p.image)
      .slice(
        0,
        ["food", "beverages", "cooking-foods"].includes(category) ? 6 : 3,
      ),
  );
  return {
    heroImage,
    categoryProducts: categoryProducts.map(publicProduct),
    bestSellers: data.popularityAvailable
      ? discountedBestSellers(data.products).slice(0, 4).map(publicProduct)
      : [],
  };
}
export async function getProductImage(slug, version) {
  const data = await snapshot.get({ allowStale: true });
  for (const source of [data, snapshot.previous()]) {
    const product = source?.products.find((p) => p.slug === slug);
    const image = decodeProductImage(product?.image);
    if (image && (!version || image.version === version)) return image;
  }
  return null;
}
