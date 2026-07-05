import { getTranslations } from "next-intl/server";
import { IntegrationPlaceholder } from "@/components/ui/IntegrationPlaceholder";

export async function BookingProvider() {
  const t = await getTranslations("Integration");
  return <IntegrationPlaceholder title={t("bookingTitle")} text={t("bookingText")} />;
}
