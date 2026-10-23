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
        <title>Ardh Sainik Canteen Kanti</title>
        <meta
          name="description"
          content="Ardh Sainik Canteen Kanti: your grocery and discount store on Station Road, Kanti, Muzaffarpur. Explore everyday essentials, product categories and savings."
        />
        <meta
          name="keywords"
          content="ardhsainikcanteen, ardhsainikcanteenkanti, kanticanteen, canteen in kanti, sainikcanteenkanti, grocerystore, discountstore, armycanteen"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico?v=light-logo" sizes="32x32" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=light-logo" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png?v=light-logo" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=light-logo" />
        <meta
          name="robots"
          content={site.indexable ? "index,follow" : "noindex,nofollow"}
        />
        <link rel="canonical" href={`${site.url}${path}`} />
        <meta property="og:title" content="Ardh Sainik Canteen Kanti" />
        <meta property="og:site_name" content="Ardh Sainik Canteen Kanti" />
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
