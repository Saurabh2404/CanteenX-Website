import { Header } from "./header";
import { SocialLinks } from "./social-links";
import { site } from "@/config/site";
export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <Header />
      {children}
      <SocialLinks
        facebookUrl={process.env.NEXT_PUBLIC_FACEBOOK_URL}
        instagramUrl={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
      />
      <footer>
        <div className="footer-grid">
          <div>
            <a className="footer-brand" href="/">
              <img src="/canteen-logo.png" alt="" width={58} height={58} />
              <span>
                <strong lang="hi">अर्ध सैनिक कैंटीन</strong>
                <b>ARDH SAINIK CANTEEN</b>
              </span>
            </a>
            <p>
              Serving Kanti with everyday essentials and value for every family.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <a href="/products">Our products</a>
            <a href="/#categories">Browse categories</a>
            <a href="/#offers">Offers & savings</a>
          </div>
          <div>
            <h3>Your canteen</h3>
            <a href="/#reviews">Customer reviews</a>
            <a href="/#events">Store updates</a>
            <a href="/#visit">Location & timings</a>
          </div>
          <div>
            <h3>We’re here to help</h3>
            <a href="tel:+917355973262">{site.phone}</a>
            <a
              href="https://wa.me/917355973262"
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp ↗
            </a>
            <p>{site.address}</p>
          </div>
        </div>
        <small>
          © {new Date().getFullYear()} ARDH SAINIK CANTEEN, Kanti · Website by
          CanteenX
        </small>
      </footer>
    </>
  );
}
