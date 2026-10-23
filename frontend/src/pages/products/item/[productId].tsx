import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { apiFetch } from "@/utils/api";
import { categories, site } from "@/config/site";
import type { Product } from "@/types/catalog";
import { PageSeo } from "@/components/page-seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
type Props = { product: Product };
export const getStaticPaths: GetStaticPaths = async () => {
  const { products } = await apiFetch<{ products: Product[] }>("/products");
  return {
    paths: products.slice(0, 4).map((p) => ({ params: { productId: p.slug } })),
    fallback: "blocking",
  };
};
export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const id = params?.productId;
  if (typeof id !== "string" || !/^(\d+|[a-f\d]{24})$/i.test(id))
    return { notFound: true, revalidate: 60 };
  const { products } = await apiFetch<{ products: Product[] }>("/products");
  const product = products.find((p) => p.slug === id);
  return product
    ? { props: { product }, revalidate: 60 }
    : { notFound: true, revalidate: 60 };
};
export default function ProductPage({ product: p }: Props) {
  const category = categories.find((c) => c.slug === p.category)!;
  const path = `/products/item/${p.slug}`;
  return (
    <main id="main" className="section product-detail">
      <PageSeo
        title={`${p.name} | Ardh Sainik Canteen Kanti`}
        description={`${p.name} at Ardh Sainik Canteen Kanti: ₹${p.price.toLocaleString("en-IN")}, ${p.discount.toFixed(1)}% below MRP. View current savings and visit our Station Road store.`}
        path={path}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: category.name, path: `/products/category/${p.category}` },
          { name: p.name, path },
        ]}
      />
      <div className="product-detail-grid">
        <div className="product-image">
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              width={480}
              height={480}
              decoding="async"
            />
          ) : (
            <p className="no-photo">Product photo coming soon</p>
          )}
        </div>
        <div>
          <p className="eyebrow">{category.name}</p>
          <h1>{p.name}</h1>
          <p className="detail-price">
            <strong>₹{p.price.toLocaleString("en-IN")}</strong>{" "}
            <del>MRP ₹{p.mrp.toLocaleString("en-IN")}</del>
          </p>
          <p className="detail-saving">
            {p.discount.toFixed(1)}% less than MRP
          </p>
          <p>
            A customer favourite sold in the last 90 days at Ardh Sainik Canteen
            Kanti. Prices refresh approximately every minute; please confirm
            availability and the final price at the canteen.
          </p>
          <p>{site.address}</p>
          <div className="actions">
            <a
              className="button"
              href="https://wa.me/917355973262"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask about availability
            </a>
            <Link
              className="text-link"
              href={`/products/category/${p.category}`}
              prefetch={false}
            >
              More {category.name.toLowerCase()}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
