import Head from "next/head";
import { GoogleReviewsSection } from "@/components/google-reviews";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ShoppingBasket,
  Clock3,
  MapPin,
  HeartHandshake,
} from "lucide-react";
import { categories, site } from "@/config/site";
import type { GetStaticProps } from "next";
import { apiFetch } from "@/utils/api";
import type { Product } from "@/types/catalog";
const faqs = [
  {
    "question": "Can I order products online?",
    "answer": "This website helps you explore products and plan an in-store visit. Online ordering is not currently available."
  },
  {
    "question": "Are the displayed prices and offers final?",
    "answer": "The catalogue reads current POS selling prices and MRPs and refreshes every minute. Prices and availability may change; please confirm at the canteen."
  },
  {
    "question": "Where can I find the latest opening hours?",
    "answer": "Confirmed timings and holiday announcements will appear in the visitor information section."
  }
];
type HomeProps = {
  heroImage: {
    url: string;
    width: number;
    height: number;
    sourceCount: number;
  } | null;
  categoryProducts: Product[];
  bestSellers: Product[];
  unavailable?: boolean;
};
// Vercel serves the cached page; one background refresh updates public inventory.
export const getStaticProps: GetStaticProps<HomeProps> = async () => ({
  props: await apiFetch<HomeProps>("/home"),
  revalidate: 60,
});
export default function Home({
  heroImage,
  categoryProducts,
  bestSellers,
  unavailable = false,
}: HomeProps) {
  return (
    <main id="main">
      <Head>
        <script type="application/ld+json" key="faq-schema" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: faqs.map(({question, answer}) => ({"@type":"Question", name:question, acceptedAnswer:{"@type":"Answer",text:answer}}))
        }).replace(/</g, "\\u003c") }} />
      </Head>
      {unavailable && (
        <p className="notice">
          Our catalogue is temporarily unavailable. Please try again shortly or
          call the canteen.
        </p>
      )}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ARDH SAINIK CANTEEN · KANTI</p>
          <p className="hero-hindi" lang="hi">
            अर्ध सैनिक कैंटीन
          </p>
          <h1>
            Everyday essentials.
            <br />
            <em>
              More value for
              <br />
              every family.
            </em>
          </h1>
          <p>
            Ardh Sainik Canteen Kanti is your local grocery and discount store
            for everyday essentials. Visit our canteen in Kanti at Ground Floor,
            SS-Complex, Station Road, opposite Block Gate, Muzaffarpur, Bihar.
            Explore our products and savings before you visit.
          </p>
          <div className="actions">
            <Link className="button" href="/products">
              Explore products & savings <ArrowUpRight size={19} />
            </Link>
            <a className="text-link" href="#visit">
              Plan your visit <ArrowRight size={17} />
            </a>
          </div>
          <div className="hero-note">
            <HeartHandshake size={22} />
            <span>
              Rooted in service.
              <br />
              <strong>Made for our community.</strong>
            </span>
          </div>
        </div>
        <div className="hero-photo grocery-hero">
          <span className="photo-label">FROM OUR CANTEEN SHELVES</span>
          <div className="inventory-hero">
            {heroImage ? (
              <img
                src={heroImage.url}
                width={heroImage.width}
                height={heroImage.height}
                alt="Forty grocery and everyday essentials from our canteen inventory"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <p>Explore everyday essentials from our canteen.</p>
            )}
          </div>
          <div className="photo-card">
            <ShoppingBasket />
            <span>
              Quality products. Honest value.
              <small>Explore. Discover. Visit.</small>
            </span>
          </div>
        </div>
        <div className="hero-index">SERVICE • COMMUNITY • EVERYDAY VALUE</div>
      </section>
      <div className="value-strip">
        <span>Groceries & staples</span>
        <i>✦</i>
        <span>Home essentials</span>
        <i>✦</i>
        <span>Personal care</span>
        <i>✦</i>
        <span>Everyday savings</span>
      </div>
      <section className="section" id="categories">
        <div className="section-head">
          <div>
            <p className="eyebrow">FIND YOUR EVERYDAY</p>
            <h2>Everything your home needs.</h2>
            <p className="section-hindi" lang="hi">
              आपके घर की हर ज़रूरत, एक ही जगह।
            </p>
          </div>
          <Link className="text-link" href="/products">
            Browse all products <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => (
            <Link
              className="category"
              key={c.slug}
              href={`/products?category=${c.slug}`}
            >
              <div
                className={`category-image category-preview category-tone-${c.tone}`}
              >
                <span className="category-number">0{i + 1}</span>
                <div
                  className={`category-packshots ${["food", "beverages", "cooking-foods"].includes(c.slug) ? "category-packshots-expanded" : ""}`}
                >
                  {categoryProducts
                    .filter((p) => p.category === c.slug)
                    .slice(
                      0,
                      ["food", "beverages", "cooking-foods"].includes(c.slug)
                        ? 6
                        : 3,
                    )
                    .map((product) => (
                      <img
                        key={product.slug}
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                    ))}
                </div>
              </div>
              <div className="category-title">
                <div>
                  <h3>{c.name}</h3>
                  <span className="category-hindi" lang="hi">
                    {c.hindi}
                  </span>
                </div>
                <ArrowUpRight size={21} />
              </div>
              <p>{c.detail}</p>
            </Link>
          ))}
        </div>
      </section>
      {bestSellers.length > 0 && (
        <section className="section best-sellers">
          <div className="section-head">
            <div>
              <p className="eyebrow">COMMUNITY FAVOURITES</p>
              <h2>Our community’s favourites.</h2>
            </div>
            <span className="muted">
              Most sold · last 90 days · At least 10% off
            </span>
          </div>
          <div className="category-grid">
            {bestSellers.map((p) => (
              <Link
                href={`/products?q=${encodeURIComponent(p.name)}`}
                className="product"
                key={p.slug}
              >
                <div className="product-image">
                  {p.image ? (
                    <img src={p.image} alt={p.name} loading="lazy" />
                  ) : (
                    <span className="no-photo">
                      Product photo
                      <br />
                      coming soon
                    </span>
                  )}
                </div>
                <h3>{p.name}</h3>
                <strong>₹{p.price.toLocaleString("en-IN")}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="offer-section" id="offers">
        <div>
          <p className="eyebrow">MORE IN YOUR BASKET</p>
          <h2>
            More savings.
            <br />
            <em>Every single day.</em>
          </h2>
          <p>
            Explore selling prices and MRPs from our canteen catalogue. Explore
            our most-sold products with at least 10% off MRP, ordered by units
            sold over the last 90 days. Please confirm availability in store.
          </p>
          <Link className="button" href="/products">
            Discover the catalogue <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="offer-art">
          <span>EVERYDAY VALUE</span>
          <ShoppingBasket size={95} strokeWidth={1} />
          <h3>
            Good things.
            <br />
            Better value.
          </h3>
          <small>Explore our canteen catalogue</small>
        </div>
      </section>
      <section className="section" id="events">
        <div className="section-head">
          <div>
            <p className="eyebrow">AROUND THE CANTEEN</p>
            <h2>News from your canteen.</h2>
          </div>
          <span className="muted">Community & updates</span>
        </div>
        <div className="two-grid">
          <article className="update-card">
            <span className="pill">STORE UPDATES</span>
            <h3>Something to look forward to.</h3>
            <p>
              Seasonal offers, new arrivals, and canteen announcements will be
              shared here. No events have been announced yet.
            </p>
          </article>
          <article className="update-card light">
            <span className="pill">LET’S STAY IN TOUCH</span>
            <h3>A familiar voice. A little help.</h3>
            <p>
              Have a question about a product or planning your visit? Call the
              canteen and we’ll be happy to help.
            </p>
            <a className="text-link my-4" href="tel:+917355973262">
              {site.phone} ↗
            </a>
          </article>
        </div>
      </section>
      <GoogleReviewsSection />
      <section className="visit section" id="visit">
        <div>
          <p className="eyebrow">WE’LL SEE YOU AT THE CANTEEN</p>
          <h2>
            Your local canteen.
            <br />
            <em>Come say hello.</em>
          </h2>
          <p>Explore online. Discover more in store.</p>
        </div>
        <div className="visit-details">
          <div>
            <MapPin />
            <span>
              <strong>Find us</strong>
              <p>
                {site.address ||
                  "Our exact address and directions will be added before launch."}
              </p>
              {site.mapsUrl && <a href={site.mapsUrl}>Get directions ↗</a>}
            </span>
          </div>
          <div>
            <Clock3 />
            <span>
              <strong>Opening hours</strong>
              <p>
                {site.hours || "Store timings will be confirmed before launch."}
              </p>
            </span>
          </div>
          <div>
            <HeartHandshake />
            <span>
              <strong>Get in touch</strong>
              <p>
                {site.phone ? (
                  <a href="tel:+917355973262">{site.phone}</a>
                ) : (
                  "Contact details will be available soon."
                )}
              </p>
            </span>
          </div>
        </div>
      </section>
      <section className="section faq">
        <p className="eyebrow">A LITTLE HELP</p>
        <h2>Before you visit.</h2>
        {faqs.map(({ question, answer }) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
