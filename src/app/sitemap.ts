import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hainabian.example";
  const routes = ["", "/about", "/pricing", "/contact", "/privacy"];

  return routes.flatMap((route) =>
    (["zh", "en"] as const).map((locale) => ({
      url: `${base}/${locale}${route}`,
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route === "/contact" ? 0.9 : 0.7,
      alternates: {
        languages: {
          zh: `${base}/zh${route}`,
          en: `${base}/en${route}`,
        },
      },
    })),
  );
}
