import { useTranslations } from "next-intl";
import { IntegrationPlaceholder } from "@/components/ui/IntegrationPlaceholder";

export function ContactFormProvider() {
  const t = useTranslations("Integration");
  return <IntegrationPlaceholder title={t("contactTitle")} text={t("contactText")} />;
}
