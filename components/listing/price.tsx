import { getLocale, getTranslations } from "next-intl/server";
import type { Currency, DealType } from "@/generated/prisma/enums";
import { formatNumber } from "@/lib/format";

/** "250,000 جنيه / شهرياً" — amount in 600 weight, the rest regular. */
export async function Price({
  price,
  currency,
  dealType,
  className,
}: {
  price: bigint;
  currency: Currency;
  dealType: DealType;
  className?: string;
}) {
  const [locale, tEnum, tListing] = await Promise.all([
    getLocale(),
    getTranslations("Enums.Currency"),
    getTranslations("Listing"),
  ]);
  const amount = formatNumber(price, locale);
  const unit = tEnum(currency);

  return (
    <span className={className}>
      {currency === "USD" && locale === "en" ? (
        <span className="font-semibold">${amount}</span>
      ) : (
        <>
          <span className="font-semibold">{amount}</span> {unit}
        </>
      )}
      {dealType === "RENT" && <span className="text-foggy"> {tListing("perMonth")}</span>}
    </span>
  );
}
