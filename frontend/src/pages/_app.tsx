import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { SiteLayout } from "@/components/site-layout";
import { site } from "@/config/site";
import "@/styles/brand-fonts.css";
import "@/styles/globals.css";
import "@/styles/brand-theme.css";
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const path = router.asPath.split("?")[0].split("#")[0];
  return (
    <>
      <Head>
        <title>ARDH SAINIK CANTEEN | Everyday essentials & savings</title>
        <meta
          name="description"
          content="Explore product categories, savings and visitor information for ARDH SAINIK CANTEEN, Kanti."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="robots"
          content={site.indexable ? "index,follow" : "noindex,nofollow"}
        />
        <link rel="canonical" href={`${site.url}${path}`} />
        <meta property="og:title" content="ARDH SAINIK CANTEEN, Kanti" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:url" content={`${site.url}${path}`} />
      </Head>
      <SiteLayout>
        <Component {...pageProps} />
      </SiteLayout>
    </>
  );
}
