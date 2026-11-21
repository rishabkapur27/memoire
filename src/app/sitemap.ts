import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { posts } from "@/lib/journal";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/order`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE.url}/track`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ...posts.map((p) => ({
      url: `${SITE.url}/journal/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
