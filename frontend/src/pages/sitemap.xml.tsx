import type { GetServerSideProps } from "next";
import { categories, site } from "@/config/site";
import { apiFetch } from "@/utils/api";
import type { Product } from "@/types/catalog";
const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const paths = [
    "/",
    "/products",
    ...categories.map((c) => `/products/category/${c.slug}`),
  ];
  if (site.indexable) {
    const { products } = await apiFetch<{ products: Product[] }>("/products");
    paths.push(...products.map((p) => `/products/item/${p.slug}`));
  }
  const urls = site.indexable
    ? paths
        .map(
          (path) =>
            `<url><loc>${escapeXml(new URL(path, site.url).href)}</loc></url>`,
        )
        .join("")
    : "";
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=60, stale-while-revalidate=300, stale-if-error=86400",
  );
  res.end(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
  );
  return { props: {} };
};
export default function Sitemap() {
  return null;
}
