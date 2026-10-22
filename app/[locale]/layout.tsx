import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { localeDirection, routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { siteUrl } from "@/lib/site";
import { CLIENT_NAMESPACES, pickMessages } from "@/i18n/client-messages";
import { AuthProvider } from "@/components/auth/auth-provider";
import "../globals.css";

// Covers Arabic and Latin in one family (DESIGN.md's Cereal has no Arabic).
const plexArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600"],
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-plex-arabic",
});

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "ar" | "en", namespace: "Metadata" });
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t("title"), template: `%s · ${t("siteName")}` },
    description: t("description"),
    applicationName: t("siteName"),
    openGraph: {
      siteName: t("siteName"),
      locale: locale === "ar" ? "ar_SD" : "en_US",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Common");
  const messages = await getMessages();

  return (
    <html lang={locale} dir={localeDirection[locale]} className={plexArabic.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-hof px-4 py-2 text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          {t("skipToContent")}
        </a>
        {/* Client islands only get the namespaces they use, to keep the HTML small on slow connections. */}
        <NextIntlClientProvider messages={pickMessages(messages, CLIENT_NAMESPACES)}>
          <AuthProvider>
          <SiteHeader />
          <main id="main" className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <SiteFooter />
          <MobileNav />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
