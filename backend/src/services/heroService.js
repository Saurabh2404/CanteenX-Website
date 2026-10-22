import { connectDatabase } from "../config/database.js";
const collectionName = "website_assets";
export async function getHeroMetadata() {
  const db = await connectDatabase();
  const asset = await db
    .collection(collectionName)
    .findOne(
      { _id: "homepage-hero" },
      { projection: { version: 1, width: 1, height: 1, sourceCount: 1 } },
    );
  return asset
    ? {
        url: `/api/hero/image?v=${asset.version}`,
        width: asset.width,
        height: asset.height,
        sourceCount: asset.sourceCount,
      }
    : null;
}
export async function getHeroImage() {
  const db = await connectDatabase();
  const asset = await db
    .collection(collectionName)
    .findOne({ _id: "homepage-hero" });
  if (!asset?.body) return null;
  return {
    body: Buffer.from(asset.body.buffer ?? asset.body),
    type: asset.contentType,
    version: asset.version,
  };
}
