import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/session";
import { safeNext } from "@/lib/safe-next";
import { LoginPageFlow } from "./login-page-flow";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as Locale, namespace: "Auth" });
  return { title: t("loginPageTitle"), robots: { index: false } };
}

/** Full-page login, used without JS or when a protected page redirects here. */
export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const next = safeNext((await searchParams).next, getPathname({ href: "/account", locale }));

  if (await getCurrentUser()) redirect(next);

  return (
    <div className="mx-auto flex max-w-[568px] flex-col px-4 py-8 md:py-16">
      <div className="rounded-[32px] bg-white px-6 py-10 md:px-10">
        <LoginPageFlow next={next} />
      </div>
    </div>
  );
}
