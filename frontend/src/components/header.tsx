import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Phone, Menu, X } from "lucide-react";
import { site } from "@/config/site";
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="announcement">
        <div>
          <span>By the Soldier, for the Community</span>
          <a href="tel:+917355973262">
            <Phone size={12} /> {site.phone}
          </a>
        </div>
      </div>
      <header>
        <Link href="/" className="brand">
          <img
            src="/canteen-logo.png"
            alt="Ardh Sainik Canteen logo"
            width={64}
            height={64}
          />
          <span>
            <strong lang="hi">अर्ध सैनिक कैंटीन</strong>
            <b>ARDH SAINIK CANTEEN</b>
            <small lang="hi">सैनिक का सलाम – आम जनता के लिए</small>
          </span>
        </Link>
        <div className="header-purpose">
          <span className="tricolor">
            <i />
            <i />
            <i />
          </span>
          <strong>Everyday value. Trusted local service.</strong>
          <small>Station Road, Kanti · Your neighbourhood canteen</small>
        </div>
      </header>
      <div
        className="navigation-bar"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setMenuOpen(false);
            event.currentTarget
              .querySelector<HTMLButtonElement>(".mobile-menu-toggle")
              ?.focus();
          }
        }}
      >
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span>
            Menu <span lang="hi"> / मेन्यू</span>
          </span>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav
          id="main-navigation"
          className={menuOpen ? "is-open" : ""}
          aria-label="Main navigation"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
          }}
        >
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/#categories">Categories</Link>
          <Link href="/#offers">Offers & savings</Link>
          <Link href="/#reviews">Customer reviews</Link>
          <Link href="/#events">Updates</Link>
          <Link href="/#visit">
            Visit us <ArrowUpRight size={14} />
          </Link>
        </nav>
      </div>
    </>
  );
}
