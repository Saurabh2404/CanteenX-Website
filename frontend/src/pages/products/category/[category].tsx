import type { GetStaticPaths, GetStaticProps } from "next";
import { categories } from "@/config/site";
import { apiFetch } from "@/utils/api";
import type { Product } from "@/types/catalog";
import { Catalog } from "@/components/catalog";
import { PageSeo } from "@/components/page-seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
type Props = {
  category: string;
  products: Product[];
  popularityAvailable: boolean;
};
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: categories.map((c) => ({ params: { category: c.slug } })),
  fallback: "blocking",
});
export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const category = categories.find((c) => c.slug === params?.category);
  if (!category) return { notFound: true, revalidate: 60 };
  const data = await apiFetch<{
    products: Product[];
    popularityAvailable: boolean;
  }>("/products");
  return {
    props: {
      category: category.slug,
      products: data.products.filter((p) => p.category === category.slug),
      popularityAvailable: data.popularityAvailable,
    },
    revalidate: 60,
  };
};
export default function CategoryPage({ category, ...data }: Props) {
  const item = categories.find((c) => c.slug === category)!;
  return (
    <main id="main" className="section catalogue">
      <PageSeo
        title={`${item.name} in Kanti | Ardh Sainik Canteen`}
        description={`Explore ${item.name.toLowerCase()} at Ardh Sainik Canteen Kanti. ${item.detail}. Browse recently sold products with at least 10% off MRP.`}
        path={`/products/category/${category}`}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: item.name, path: `/products/category/${category}` },
        ]}
      />
      <p className="eyebrow">ARDH SAINIK CANTEEN KANTI</p>
      <h1>{item.name}</h1>
      <p lang="hi" className="section-hindi">
        {item.hindi}
      </p>
      <p>
        {item.detail} at our Station Road canteen in Kanti. Browse favourites
        sold in the last 90 days, with at least 10% off MRP. Please confirm
        stock in store.
      </p>
      <Catalog key={category} {...data} initialCategory={category} />
    </main>
  );
}
