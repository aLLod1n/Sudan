import { getTranslations } from "next-intl/server";
import { MobileNavLinks } from "./mobile-nav-links";

/** Bottom tab bar on phones (hidden from md up). */
export async function MobileNav() {
  const t = await getTranslations("Nav");
  return (
    <MobileNavLinks
      items={[
        { href: "/", label: t("home"), icon: "home" },
        { href: "/listings", label: t("explore"), icon: "search" },
        { href: "/listings/new", label: t("postShort"), icon: "post", auth: true },
        { href: "/agents", label: t("agents"), icon: "agents" },
        { href: "/account", label: t("account"), icon: "account", auth: true },
      ]}
    />
  );
}
