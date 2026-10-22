import type { GetServerSideProps } from "next";
import { site } from "@/config/site";
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const urls = site.indexable
    ? ["", "/products"]
        .map(
          (path) =>
            `<url><loc>${`${site.url}${path}`.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</loc></url>`,
        )
        .join("")
    : "";
  res.setHeader("Content-Type", "application/xml");
  res.write(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
  );
  res.end();
  return { props: {} };
};
export default function Sitemap() {
  return null;
}
