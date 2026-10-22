import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import mongoose from "mongoose";
import {
  getCatalog,
  getProductImage,
} from "../backend/src/services/catalogService.js";
import { connectDatabase } from "../backend/src/config/database.js";
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(
  fileURLToPath(new URL("../frontend", import.meta.url)),
  true,
);
try {
  const products = (await getCatalog()).products
    .filter((p) => p.image)
    .slice(0, 40);
  if (!products.length) throw new Error("No inventory images are available.");
  const width = 960,
    columns = 8,
    cellWidth = 120,
    cellHeight = 120;
  const height = Math.ceil(products.length / columns) * cellHeight;
  const layers = [];
  let originalBytes = 0;
  const fingerprint = createHash("sha256");
  for (let i = 0; i < products.length; i++) {
    const source = await getProductImage(products[i].slug);
    if (!source)
      throw new Error(
        "An inventory image is unavailable; existing hero preserved.",
      );
    originalBytes += source.body.length;
    fingerprint.update(source.body);
    const input = await sharp(source.body)
      .rotate()
      .resize(104, 104, { fit: "contain", background: "#ffffff" })
      .flatten({ background: "#ffffff" })
      .png()
      .toBuffer();
    layers.push({
      input,
      left: (i % columns) * cellWidth + 8,
      top: Math.floor(i / columns) * cellHeight + 8,
    });
  }
  const body = await sharp({
    create: { width, height, channels: 3, background: "#ffffff" },
  })
    .composite(layers)
    .webp({ quality: 78, effort: 6 })
    .toBuffer();
  const version = createHash("sha256").update(body).digest("hex").slice(0, 16);
  const db = await connectDatabase();
  await db
    .collection("website_assets")
    .updateOne(
      { _id: "homepage-hero" },
      {
        $set: {
          body,
          version,
          width,
          height,
          contentType: "image/webp",
          sourceCount: products.length,
          sourceFingerprint: fingerprint.digest("hex"),
          originalBytes,
          compressedBytes: body.length,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  console.log(
    JSON.stringify({
      sourceImages: products.length,
      originalBytes,
      compressedBytes: body.length,
      reductionPercent: Math.round((1 - body.length / originalBytes) * 100),
    }),
  );
} catch (error) {
  console.error(
    "Hero generation failed:",
    error.name,
    error.code || "check database configuration",
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
