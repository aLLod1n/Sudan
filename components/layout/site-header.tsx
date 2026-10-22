import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthLink } from "@/components/auth/auth-link";
import { HeaderAccount } from "@/components/auth/header-account";
import { Logo } from "./logo";
import { HeaderNavLinks } from "./header-nav-links";
import { LanguageSwitcher } from "./language-switcher";

export async function SiteHeader() {
  const t = await getTranslations("Nav");
  const tc = await getTranslations("Common");

  return (
    <header className="sticky top-0 z-40 border-b border-bebe bg-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:h-20 md:px-10">
        <Link href="/" aria-label={tc("siteName")} className="flex h-11 items-center rounded-lg">
          <Logo name={tc("siteName")} />
        </Link>

        {/* useSearchParams inside: Suspense keeps the rest of the page static. */}
        <Suspense fallback={<div className="hidden md:block" />}>
          <HeaderNavLinks
            items={[
              { pathname: "/listings", deal: "SALE", label: t("forSale") },
              { pathname: "/listings", deal: "RENT", label: t("forRent") },
              { pathname: "/agents", label: t("agentsLong") },
            ]}
          />
        </Suspense>

        <div className="flex items-center gap-2">
          <AuthLink
            href="/listings/new"
            className="hidden rounded-full px-3 py-2.5 text-sm font-medium hover:bg-faint md:inline-block"
          >
            {t("post")}
          </AuthLink>
          <Suspense fallback={<div className="h-10 w-24 rounded-full bg-faint" />}>
            <LanguageSwitcher label={t("switchLanguage")} ariaLabel={t("language")} />
          </Suspense>
          <HeaderAccount
            labels={{
              account: t("account"),
              login: t("login"),
              myListings: t("myListings"),
              post: t("post"),
              admin: t("admin"),
              logout: t("logout"),
            }}
          />
        </div>
      </div>
    </header>
  );
}
