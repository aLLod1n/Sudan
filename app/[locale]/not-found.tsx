import { getTranslations } from "next-intl/server";
import { SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("Common");
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <SearchX className="size-12 text-foggy" strokeWidth={1.4} aria-hidden />
      <h1 className="text-heading-sm font-semibold">{t("notFound")}</h1>
      <p className="text-foggy">{t("notFoundBody")}</p>
      <Link href="/" className={buttonVariants()}>
        {t("goHome")}
      </Link>
    </div>
  );
}
