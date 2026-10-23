import { site } from "@/config/site";
import Head from "next/head";
import { useRouter } from "next/router";
import type { GetStaticProps } from "next";
import { Catalog } from "@/components/catalog";
import { apiFetch } from "@/utils/api";
import type { Product } from "@/types/catalog";
type ProductsProps = {
  products: Product[];
  popularityAvailable: boolean;
  initialCategory: string;
  initialQuery: string;
  unavailable: boolean;
};
export const getStaticProps: GetStaticProps<ProductsProps> = async () => {
  const data = await apiFetch<{
    products: Product[];
    popularityAvailable: boolean;
  }>("/products");
  return {
    props: {
      ...data,
      initialCategory: "all",
      initialQuery: "",
      unavailable: false,
    },
    revalidate: 60,
  };
};
export default function Products(props: ProductsProps) {
  const router = useRouter();
  const initialCategory =
    typeof router.query.category === "string" ? router.query.category : "all";
  const initialQuery = typeof router.query.q === "string" ? router.query.q : "";
  return (
    <>
      <Head>
        <title>Explore products | Ardh Sainik Canteen Kanti</title>
        <script type="application/ld+json" key="breadcrumb-schema" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:[
            {"@type":"ListItem",position:1,name:"Home",item:site.url+"/"},
            {"@type":"ListItem",position:2,name:"Products",item:site.url+"/products"}
          ]
        }).replace(/</g,"\\u003c") }} />
        <meta
          name="description"
          content="Explore our most-sold canteen products with at least 10% off MRP."
        />
      </Head>
      <main id="main" className="section catalogue">
        <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span aria-current="page">Products</span></nav>
        <p className="eyebrow">THE CANTEEN COLLECTION</p>
        <h1>
          Find your <em>everyday.</em>
        </h1>
        <p>Explore our best sellers with at least 10% off MRP.</p>
        {props.unavailable ? (
          <p className="notice">
            The catalogue is temporarily unavailable. Please try again shortly.
          </p>
        ) : (
          <Catalog
            key={`${initialCategory}:${initialQuery}`}
            {...props}
            initialCategory={initialCategory}
            initialQuery={initialQuery}
          />
        )}
      </main>
    </>
  );
}
