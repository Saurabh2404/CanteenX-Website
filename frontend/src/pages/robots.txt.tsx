import type { GetServerSideProps } from "next";
import { site } from "@/config/site";
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.write(
    site.indexable
      ? `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`
      : "User-agent: *\nDisallow: /\n",
  );
  res.end();
  return { props: {} };
};
export default function Robots() {
  return null;
}
