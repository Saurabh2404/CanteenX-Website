import { connectDatabase } from "../config/database.js";
import { createSnapshotCache } from "../utils/snapshotCache.js";
async function readAsset() {
  const connection = await connectDatabase();
  const db = process.env.HERO_DATABASE_NAME
    ? connection.useDb(process.env.HERO_DATABASE_NAME, { useCache: true })
    : connection;
  return db.collection("website_assets").findOne({ _id: "homepage-hero" });
}
const snapshot = (globalThis.__canteenWebsiteHero ??=
  createSnapshotCache(readAsset));
export async function getHeroMetadata() {
  const asset = await snapshot.get();
  return asset?.body
    ? {
        url: `/api/images/hero/${asset.version}`,
        width: asset.width,
        height: asset.height,
        sourceCount: asset.sourceCount,
      }
    : null;
}
export async function getHeroImage(version) {
  const asset = await snapshot.get({ allowStale: true });
  for (const candidate of [asset, snapshot.previous()]) {
    if (candidate?.body && (!version || candidate.version === version))
      return {
        body: Buffer.from(candidate.body.buffer ?? candidate.body),
        type: candidate.contentType,
        version: candidate.version,
      };
  }
  return null;
}
