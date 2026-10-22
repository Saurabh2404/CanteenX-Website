import { createHash } from "node:crypto";
import { connectDatabase } from "../config/database.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import {
  classifyProduct,
  discount,
  discountedBestSellers,
} from "../utils/catalogRules.js";
let popularity;
export async function getCatalog() {
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
  } catch {
    popularityAvailable = false;
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
      image:
        typeof p.image === "string" && p.image
          ? `/api/products/${p.productId ?? p._id}/image?v=${createHash("sha256").update(p.image).digest("hex").slice(0, 16)}`
          : "",
    }));
  products.sort(
    (a, b) =>
      (a.popularityRank || Infinity) - (b.popularityRank || Infinity) ||
      a.name.localeCompare(b.name),
  );
  return { products, popularityAvailable };
}
export async function getPublicCatalog() {
  const data = await getCatalog();
  return {
    products: data.popularityAvailable
      ? discountedBestSellers(data.products)
      : [],
    popularityAvailable: data.popularityAvailable,
  };
}
export async function getHomeData() {
  const data = await getCatalog();
  const heroProducts = data.products.filter((p) => p.image).slice(0, 40);
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
    heroProducts,
    categoryProducts,
    bestSellers: data.popularityAvailable
      ? discountedBestSellers(data.products).slice(0, 4)
      : [],
  };
}
export async function getProductImage(slug) {
  await connectDatabase();
  const query = /^\d+$/.test(slug)
    ? { productId: Number(slug) }
    : { _id: slug };
  const product = await Product.findOne(query)
    .select("image -_id")
    .lean()
    .maxTimeMS(5000);
  const match = product?.image?.match(
    /^data:image\/(webp|png|jpeg);base64,([\s\S]+)$/,
  );
  if (!match) return null;
  return { type: `image/${match[1]}`, body: Buffer.from(match[2], "base64") };
}
