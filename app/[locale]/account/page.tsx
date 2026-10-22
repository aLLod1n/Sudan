import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BriefcaseBusiness, Eye, Home, MousePointerClick } from "lucide-react";
import { cn } from "cn";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/listing/price";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { fileUrl } from "@/lib/storage";
import { formatDate, formatNumber } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import type { ListingStatus } from "@/generated/prisma/enums";
import { NameForm } from "./name-form";
import { LogoutButton } from "./logout-button";

export async function generateMetadata({ params }: PageProps<"/[locale]/account">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as Locale, namespace: "Account" });
  return { title: t("title"), robots: { index: false } };
}

const statusStyle: Record<ListingStatus, string> = {
  ACTIVE: "bg-hof text-white",
  PENDING: "bg-deco text-hof",
  REJECTED: "bg-destructive/10 text-destructive",
  EXPIRED: "bg-faint text-foggy border border-deco",
  REMOVED: "bg-destructive/10 text-destructive",
};

export default async function AccountPage({ params }: PageProps<"/[locale]/account">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const user = await requireUser(locale, "/account");

  const [t, tNav, tRole, tStatus, listings, agent] = await Promise.all([
    getTranslations("Account"),
    getTranslations("Nav"),
    getTranslations("Enums.Role"),
    getTranslations("Enums.ListingStatus"),
    prisma.listing.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        price: true,
        currency: true,
        dealType: true,
        views: true,
        contactClicks: true,
        expiresAt: true,
        rejectionReason: true,
        photos: { orderBy: { position: "asc" }, take: 1, select: { key: true } },
      },
    }),
    prisma.agentProfile.findUnique({ where: { userId: user.id }, select: { slug: true, officeName: true } }),
  ]);

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-8 px-4 py-6 md:px-10 md:py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-heading font-semibold">{t("title")}</h1>
        <LogoutButton label={t("logout")} />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <section aria-labelledby="profile-title" className="flex flex-col gap-5 rounded-xl bg-white p-5 md:p-6">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-full bg-hof text-2xl font-semibold text-white">
              {user.needsName ? "?" : user.name.trim().charAt(0)}
            </span>
            <div>
              <h2 id="profile-title" className="text-subheading font-semibold" dir="auto">
                {user.needsName ? t("profile") : user.name}
              </h2>
              <p className="text-sm text-foggy">{t("memberSince", { date: formatDate(user.createdAt, locale) })}</p>
            </div>
          </div>
          <NameForm defaultName={user.needsName ? "" : user.name} />
          <dl className="grid grid-cols-2 gap-4 border-t border-bebe pt-5 text-sm">
            <div>
              <dt className="text-foggy">{t("phone")}</dt>
              <dd className="font-medium" dir="ltr">
                <span className="inline-block">{formatPhone(user.phone)}</span>
              </dd>
            </div>
            <div>
              <dt className="text-foggy">{t("role")}</dt>
              <dd className="font-medium">{tRole(user.role)}</dd>
            </div>
          </dl>
          {user.role === "ADMIN" && (
            <Link href="/admin" className={buttonVariants({ variant: "outline", className: "self-start" })}>
              {t("admin")}
            </Link>
          )}
        </section>

        <aside className="flex flex-col gap-3 rounded-xl bg-white p-5 md:p-6">
          <BriefcaseBusiness className="size-8" strokeWidth={1.4} aria-hidden />
          {agent ? (
            <>
              <h2 className="font-semibold">{t("agentProfile")}</h2>
              <p className="text-sm text-foggy" dir="auto">
                {agent.officeName}
              </p>
              <Link href={`/agents/${agent.slug}`} className={buttonVariants({ variant: "outline", className: "self-start" })}>
                {t("viewAgentPage")}
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-semibold">{t("becomeAgent")}</h2>
              <p className="text-sm text-foggy">{t("becomeAgentBody")}</p>
              <Link href="/account/agent" className={buttonVariants({ className: "self-start" })}>
                {t("becomeAgentCta")}
              </Link>
            </>
          )}
        </aside>
      </div>

      <section id="listings" aria-labelledby="listings-title" className="flex scroll-mt-24 flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="listings-title" className="text-heading-sm font-medium tracking-display">
            {t("myListings")}
          </h2>
          <Link href="/listings/new" className={buttonVariants({ variant: "brand", size: "sm" })}>
            {tNav("post")}
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-12 text-center">
            <Home className="size-10 text-foggy" strokeWidth={1.4} aria-hidden />
            <p className="text-foggy">{t("noListings")}</p>
            <Link href="/listings/new" className={buttonVariants()}>
              {t("postFirst")}
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {listings.map((l) => (
              <li key={l.id} className="flex gap-4 rounded-xl bg-white p-3">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-deco">
                  {l.photos[0] && (
                    <Image src={fileUrl(l.photos[0].key)} alt="" fill sizes="96px" quality={60} className="object-cover" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/listings/${l.id}`}
                      dir="auto"
                      className="truncate font-medium hover:underline"
                    >
                      {l.title}
                    </Link>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyle[l.status])}>
                      {tStatus(l.status)}
                    </span>
                  </div>
                  <Price price={l.price} currency={l.currency} dealType={l.dealType} className="text-sm" />
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foggy">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3.5" aria-hidden />
                      {t("views", { count: formatNumber(l.views, locale) })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick className="size-3.5" aria-hidden />
                      {t("clicks", { count: formatNumber(l.contactClicks, locale) })}
                    </span>
                    {l.status === "ACTIVE" && l.expiresAt && <span>{t("expiresOn", { date: formatDate(l.expiresAt, locale) })}</span>}
                  </p>
                  {l.status === "REJECTED" && l.rejectionReason && (
                    <p className="text-xs text-destructive" dir="auto">
                      {l.rejectionReason}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
