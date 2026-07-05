import { getTranslations } from "next-intl/server";
import { IntegrationPlaceholder } from "@/components/ui/IntegrationPlaceholder";

export async function PaymentProvider() {
  const t = await getTranslations("Integration");
  return <IntegrationPlaceholder title={t("paymentTitle")} text={t("paymentText")} />;
}
