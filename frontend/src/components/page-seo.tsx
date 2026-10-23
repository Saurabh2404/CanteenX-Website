import Head from "next/head";
import { site } from "@/config/site";
export function PageSeo({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const url = new URL(path, site.url).href;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} key="description" />
      <link rel="canonical" href={url} key="canonical" />
      <meta property="og:title" content={title} key="og-title" />
      <meta
        property="og:description"
        content={description}
        key="og-description"
      />
      <meta property="og:url" content={url} key="og-url" />
      <meta name="twitter:title" content={title} key="twitter-title" />
      <meta
        name="twitter:description"
        content={description}
        key="twitter-description"
      />
    </Head>
  );
}
export function StructuredData({ id, value }: { id: string; value: object }) {
  return (
    <Head>
      <script
        key={id}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(value).replace(/</g, "\\u003c"),
        }}
      />
    </Head>
  );
}
