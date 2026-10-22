import {
  getPublicCatalog,
  getHomeData,
  getProductImage,
} from "../services/catalogService.js";
export async function listProducts(_req, res) {
  res.json(await getPublicCatalog());
}
export async function homeData(_req, res) {
  res.json(await getHomeData());
}
export async function productImage(req, res) {
  const image = await getProductImage(req.params.slug);
  if (!image)
    return res.status(404).json({ error: "Product image unavailable." });
  res.type(image.type).send(image.body);
}
