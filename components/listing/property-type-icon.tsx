import { Building, Building2, House, LandPlot, Store, type LucideProps } from "lucide-react";
import type { PropertyType } from "@/generated/prisma/enums";

const icons = {
  APARTMENT: Building2,
  HOUSE: House,
  LAND: LandPlot,
  SHOP: Store,
  OFFICE: Building,
} as const satisfies Record<PropertyType, unknown>;

export function PropertyTypeIcon({ type, ...props }: { type: PropertyType } & LucideProps) {
  const Icon = icons[type];
  return <Icon aria-hidden strokeWidth={1.6} {...props} />;
}
