import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Phone, Menu, X } from "lucide-react";
import { site } from "@/config/site";
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="announcement">
        <div>
          <Link
            href="/"
            className="utility-brand"
            aria-label="Ardh Sainik Canteen home"
          >
            <img src="/canteen-logo-small.webp" alt="" width={30} height={30} />
            <span>Ardh Sainik Canteen</span>
          </Link>
          <span className="utility-motto">
            By the Soldier, for the Community
          </span>
          <a href="tel:+917355973262">
            <Phone size={12} /> {site.phone}
          </a>
        </div>
      </div>
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
    </header>
  );
}
