import Head from "next/head";
import type { GetServerSideProps } from "next";
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
export const getServerSideProps: GetServerSideProps<ProductsProps> = async ({
  query,
  res,
}) => {
  res.setHeader("Cache-Control", "no-store");
  const selection = {
    initialCategory:
      typeof query.category === "string" ? query.category : "all",
    initialQuery: typeof query.q === "string" ? query.q : "",
  };
  try {
    const data = await apiFetch<{
      products: Product[];
      popularityAvailable: boolean;
    }>("/products");
    return { props: { ...data, ...selection, unavailable: false } };
  } catch {
    return {
      props: {
        products: [],
        popularityAvailable: false,
        ...selection,
        unavailable: true,
      },
    };
  }
};
export default function Products(props: ProductsProps) {
  return (
    <>
      <Head>
        <title>Explore products | ARDH SAINIK CANTEEN</title>
        <meta
          name="description"
          content="Explore our most-sold canteen products with at least 10% off MRP."
        />
      </Head>
      <main id="main" className="section catalogue">
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
            key={`${props.initialCategory}:${props.initialQuery}`}
            {...props}
          />
        )}
      </main>
    </>
  );
}
