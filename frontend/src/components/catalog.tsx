import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Search } from "lucide-react";
import { categories } from "@/config/site";
import type { Product } from "@/types/catalog";
export function Catalog({
  products,
  initialCategory = "all",
  initialQuery = "",
  popularityAvailable = true,
}: {
  products: Product[];
  initialCategory?: string;
  initialQuery?: string;
  popularityAvailable?: boolean;
}) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [limit, setLimit] = useState(24);
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible")
        void router.replace(router.asPath, undefined, { scroll: false });
    }, 60000);
    return () => clearInterval(timer);
  }, [router]);
  const eligible = popularityAvailable ? products : [];
  const filtered = eligible.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <div className="catalog-controls">
        <div className="filters" aria-label="Filter products">
          {[{ slug: "all", name: "All products" }, ...categories].map((c) => (
            <button
              aria-pressed={category === c.slug}
              className={category === c.slug ? "active" : ""}
              key={c.slug}
              onClick={() => {
                setCategory(c.slug);
                setLimit(24);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Search products"
            placeholder="Find an essential…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(24);
            }}
          />
        </label>
      </div>
      <p className="notice">
        {eligible.length.toLocaleString()} products with at least 10% off MRP ·
        Updated from the canteen catalogue every minute. Please confirm stock in
        store.
      </p>
      {!popularityAvailable && (
        <p className="notice">
          Sales rankings are temporarily unavailable. Please try again shortly.
        </p>
      )}
      <p className="catalog-caption" aria-live="polite">
        {filtered.length.toLocaleString()} results · Best sellers by units sold
        in the last 90 days · 10% discount or more
      </p>
      <div className="product-grid">
        {filtered.slice(0, limit).map((p) => (
          <article className="product" key={p.slug}>
            <div className="product-image">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement?.classList.add(
                      "image-unavailable",
                    );
                  }}
                />
              ) : (
                <span className="no-photo">
                  Product photo
                  <br />
                  coming soon
                </span>
              )}
              {p.discount > 0 && (
                <span className="badge">
                  {p.discount.toFixed(1)}% less than MRP
                </span>
              )}
            </div>
            <small>{categories.find((c) => c.slug === p.category)?.name}</small>
            <h3>{p.name}</h3>
            {p.popularityRank > 0 && p.popularityRank <= 20 && (
              <span className="popular-label">Frequently purchased</span>
            )}
            <strong>
              ₹{p.price.toLocaleString("en-IN")}{" "}
              {p.mrp > p.price && <del>₹{p.mrp.toLocaleString("en-IN")}</del>}
            </strong>
          </article>
        ))}
      </div>
      {filtered.length > limit && (
        <button
          className="button load-more"
          onClick={() => setLimit(limit + 24)}
        >
          Show more products ({filtered.length - limit} remaining)
        </button>
      )}
      {!filtered.length && (
        <p className="empty">
          No sold products with at least 10% discount match this selection. Try
          another category or search.
        </p>
      )}
    </>
  );
}
