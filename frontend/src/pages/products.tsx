import { PageSeo } from "@/components/page-seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
      <PageSeo
        title="Grocery offers in Kanti | Ardh Sainik Canteen"
        description="Browse recently sold groceries and everyday essentials with at least 10% off MRP at Ardh Sainik Canteen Kanti. Compare prices before your store visit."
        path="/products"
      />
      <main id="main" className="section catalogue">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
          ]}
        />
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
