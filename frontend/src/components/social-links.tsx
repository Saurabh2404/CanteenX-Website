import { Facebook, Instagram, Phone, MessageCircle } from "lucide-react";
function profile(value: string | undefined, domain: string) {
  try {
    const u = new URL(value || "");
    return u.protocol === "https:" &&
      (u.hostname === domain || u.hostname.endsWith("." + domain))
      ? u.href
      : "";
  } catch {
    return "";
  }
}
export function SocialLinks({
  facebookUrl = "",
  instagramUrl = "",
}: {
  facebookUrl?: string;
  instagramUrl?: string;
}) {
  const links = [
    {
      name: "Facebook",
      label: "Visit our Facebook page",
      url: profile(facebookUrl, "facebook.com"),
      icon: <Facebook size={25} fill="currentColor" />,
      className: "social-facebook",
    },
    {
      name: "Instagram",
      label: "Visit our Instagram profile",
      url: profile(instagramUrl, "instagram.com"),
      icon: <Instagram size={26} />,
      className: "social-instagram",
    },
    {
      name: "WhatsApp",
      label: "Contact the canteen on WhatsApp",
      url: "https://wa.me/917355973262",
      icon: (
        <>
          <MessageCircle size={30} />
          <Phone size={13} className="whatsapp-phone" fill="currentColor" />
        </>
      ),
      className: "social-whatsapp",
    },
    {
      name: "Call",
      label: "Call ARDH SAINIK CANTEEN",
      url: "tel:+917355973262",
      icon: <Phone size={25} fill="currentColor" />,
      className: "social-phone",
    },
  ];
  return (
    <aside className="social-rail" aria-label="Contact and social media">
      {links.map((link) =>
        link.url ? (
          <a
            key={link.name}
            className={`social-icon ${link.className}`}
            href={link.url}
            aria-label={link.label}
            title={link.label}
            {...(link.url.startsWith("https:")
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
          >
            {link.icon}
            <span className="social-tooltip">{link.name}</span>
          </a>
        ) : (
          <button
            key={link.name}
            type="button"
            className={`social-icon social-pending ${link.className}`}
            aria-label={`${link.name} link coming soon`}
            aria-disabled="true"
            title={`${link.name} link coming soon`}
          >
            {link.icon}
            <span className="social-tooltip">{link.name} · coming soon</span>
          </button>
        ),
      )}
    </aside>
  );
}
